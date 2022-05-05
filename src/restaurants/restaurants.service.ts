import { Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entitiy";
import { Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-cateogories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
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
            let isOwner = await this.checkRestaurantOwner(owner, editRestaurantInput.restaurantId);
            if (!isOwner.ok) {
                return isOwner;
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

    async deleteRestaurant(
        owner: User,
        deleteRestaurant: DeleteRestaurantInput
    ): Promise<DeleteRestaurantOutput> {
        try {
            let isOwner = await this.checkRestaurantOwner(owner, deleteRestaurant.restaurantId);
            if (!isOwner.ok) {
                return isOwner;
            }

            await this.restaurants.delete(deleteRestaurant.restaurantId)
            return {
                ok: true
            }
        } catch (error) {
            return {
                ok: false,
                error: "Could not delete Restaurant."
            }
        }
    }

    async checkRestaurantOwner(owner: User, restaurantId: number) {
        const restaurant = await this.restaurants.findOne(restaurantId);
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

        return { ok: true };
    }

    countRestaurants(category: Category) {
        return this.restaurants.count({ category });
    }

    /*
    * Category
    */
    async allCategories(): Promise<AllCategoriesOutput> {
        try {
            const categories = await this.categories.find();
            return {
                ok: true,
                categories
            }
        } catch (error) {
            return {
                ok: false,
                error: 'Category not found',
            }
        }
    }

    async findCategoryBySlug({ slug }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne(
                { slug },
                { relations: ['restaurants'] },
            );
            if (!category) {
                return {
                    ok: false,
                    error: 'Category not found',
                };
            }
            return {
                ok: true,
                category,
            };
        } catch {
            return {
                ok: false,
                error: 'Could not load category',
            };
        }
    }
}