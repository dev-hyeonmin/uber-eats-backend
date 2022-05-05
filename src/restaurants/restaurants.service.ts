import { Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entitiy";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOuput } from "./dtos/edit-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurants.entity";
import { CategoryRepository } from "./repositories/category.repository";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>, // 이름은 restaurants이고 class는 Restaurant entitiy를 가진 Repository
        private readonly categories: CategoryRepository,
    ) { }

    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> {
        //console.log(createRestaurantInput);
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;

            const category = await this.categories.getOrCreate(
                createRestaurantInput.categoryName,
            );
            newRestaurant.category = category;

            await this.restaurants.save(newRestaurant);
            return {
                ok: true,
            };
        } catch (error) {
            return {
                ok: false,
                error: 'Could not create restaurant',
            };
        }
    }

    async editRestaurant(
        owner: User,
        editRestaurantInput: EditRestaurantInput
    ): Promise<EditRestaurantOuput> {
        try {
            const restaurant = await this.restaurants.findOne(editRestaurantInput.restaurantId);
            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found."
                }
            }

            if (owner.id != restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't edit a restuarant that you don't own"
                }
            }

            let category: Category = null;
            if (editRestaurantInput.categoryName) {
                category = await this.categories.getOrCreate(editRestaurantInput.categoryName);
            }

            // save :: id를 전달하지 않을 경우 insert 진행
            await this.restaurants.save([
                {
                    id: editRestaurantInput.restaurantId,
                    ...editRestaurantInput,
                    ...(category && { category })
                }
            ]);

            return { ok: true }
        } catch (error) {
            return {
                ok: false,
                error: "Could not edit Restaurant."
            }
        }
    }
}