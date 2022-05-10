import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem])],
    providers: [OrderService, OrderResolver],
})
export class OrderModule { }
