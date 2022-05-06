import { Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entitiy";
import { ILike, Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-cateogories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOuput } from "./dtos/edit-restaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
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

    async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({ skip: (page - 1) * 25, take: 25 });
            return {
                ok: true,
                results: restaurants,
                totalPages: Math.ceil(totalResults / 25),
                totalResults,
            };
        } catch (error) {
            return {
                ok: false,
                error: 'Could not load restaurants',
            }
        }
    }

    async findRestaurantById({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId);

            if (!restaurant) {
                return {
                    ok: false,
                    error: 'Restaurant not found',
                }
            }

            return {
                ok: true,
                restaurant,
            };
        } catch (error) {
            return {
                ok: false,
                error: 'Could not find restaurant',
            }
        }
    }

    async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
        try {
            const restaurants = await this.restaurants.find({
                where: {
                    name: ILike(`%${query}%`),
                    //name: Raw(name => `${name} ILIKE '%${query}%'`),
                },
                skip: (page - 1) * 25,
                take: 25,
            });

            return {
                ok: true,
                restaurants,
            };
        } catch (error) {
            return {
                ok: false,
                error: 'Could not search for restaurants'
            }
        }
    }

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

    async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne(
                { slug },
                // { relations: ['restaurants'] }, -> 조회할때마다 모든 리스트를 불러와서 X
            );
            if (!category) {
                return {
                    ok: false,
                    error: 'Category not found',
                };
            }

            const restaurants = await this.restaurants.find({
                where: {
                    category
                },
                take: 25,
                skip: (page - 1) * 25
            });

            category.restaurants = restaurants;
            const totalResults = await this.countRestaurants(category);

            return {
                ok: true,
                category,
                totalPages: Math.ceil(totalResults / 25),
            };
        } catch {
            return {
                ok: false,
                error: 'Could not load category',
            };
        }
    }
}