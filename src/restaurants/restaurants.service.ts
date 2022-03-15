import { Injectable, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
import { Restaurant } from "./entities/restaurants.entity";

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant> // 이름은 restaurants이고 class는 Restaurant entitiy를 가진 Repository
    ) { }

    getAll(): Promise<Restaurant[]> {
        return this.restaurants.find();
    }
    createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
        //xconsole.log(createRestaurantDto);
        const newRestaurant = this.restaurants.create(createRestaurantDto);
        return this.restaurants.save(newRestaurant);
    }
    updateRestaurant({ id, data }: UpdateRestaurantDto) {
        //console.log(data);
        return this.restaurants.update(id, { ...data });
    }
}