import { Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entitiy";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Restaurant } from "./entities/restaurants.entity";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>, // 이름은 restaurants이고 class는 Restaurant entitiy를 가진 Repository
        @InjectRepository(Category)
        private readonly categories: Repository<Category>
    ) { }

    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> {
        //xconsole.log(createRestaurantInput);
        try {
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;

            const categoryName = createRestaurantInput.categoryName.trim().toLowerCase();
            const categorySlug = categoryName.replace(/ /g, '-');
            let category = await this.categories.findOne({ slug: categorySlug });
            if (!category) {
                category = await this.categories.save(
                    this.categories.create({
                        slug: categorySlug, name: categoryName
                    })
                )
            }
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
}