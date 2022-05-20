import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "src/restaurants/entities/restaurants.entity";
import { User } from "src/users/entities/user.entitiy";
import { Repository } from "typeorm";
import { CreatePaymentInput, CreatePaymentOutput } from "./dtos/create-payment";
import { Payment } from "./entities/payments.entity";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly payment: Repository<Payment>,
        @InjectRepository(Restaurant)
        private readonly restaurant: Repository<Restaurant>,
    ) { }
    
    async createPayment(owner: User, { transactionId, restaurantId}: CreatePaymentInput):Promise<CreatePaymentOutput> {
        try {
            const restaurant = await this.restaurant.findOne(restaurantId);
            if (!restaurant) {
                return {
                    ok: false,
                    error: 'Restaurant not found.'
                }
            }

            if (restaurant.ownerId != owner.id) {
                return {
                    ok: false,
                    error: 'You are not allowed to do this.',
                }
            }
            await this.payment.save(
                this.payment.create({
                    transactionId,
                    restaurant,
                    user: owner
                })
            );
            return {
                ok: true
            }
        } catch (error) {
            return {
                ok: false,
                error: 'Could not create payment.'
            }
        }
    }
}