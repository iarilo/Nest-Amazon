import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import * as paypal from '@edribeiro/checkout-server-sdk'
import { OrderDto } from './order.dto'
import { ReturnProductObject } from 'src/product/returnProduct.Object'
import { PaymentStatusDto } from './payment-status.dto'

// Указываю параметры подключения
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.Secret_Key_1

// Создаю среду  разработки в  песочницы
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret)
// PayPalHttpClient: предназначен для отправки заказов
const client = new paypal.core.PayPalHttpClient(environment)

@Injectable()
export class OrderService {
	constructor(private readonly prisma: PrismaService) {}

	async orderAll(userId: number) {
		const allOrder = await this.prisma.order.findMany({
			// Получение всех товаров по  userId
			//    where: проверяет по
			where: { newuserId: userId },
			//orderBy: Сортирует по
			orderBy: { createAt: 'desc' },
			include: {
				items: {
					include: {
						product: { select: ReturnProductObject },
					},
				},
			},
		})
		return allOrder
	}
	// .................................................

	async placeOrder(dto: OrderDto, userId: number) {
		const total = dto.items.reduce((acc, item) => {
			return acc + item.price * item.quantity
		}, 0)

		const order = await this.prisma.order.create({
			data: {
				status: dto.status,
				items: { create: dto.items },
				// connect: подсоединить
				newuser: { connect: { id: userId } },
				total: total,
			},
			// include: включить
			include: {
				items: {
					include: {
						product: { select: ReturnProductObject },
					},
				},
			},
		})

		// Оплата
		const { items } = order
		// OrdersCreateRequest  Создаёт заказ на покупку paypal
		const payment = new paypal.orders.OrdersCreateRequest()
         // requestBody  -   метод который передаёт данные о продукте в paypal
		payment.requestBody({
			// intent - фиксированный  заказ
			intent: 'CAPTURE',
			// purchase_units - Детали покупки
			purchase_units: [
				{
						// amount - В какой  валюте
					amount: {
						currency_code: 'USD',
						value: total.toFixed(2),
						// breakdown -  общая сумма
						breakdown: {
							item_total: {
								currency_code: 'USD',
								value: total.toFixed(2),
							},
						},
					},
					items: items.map(ell => ({
						name: ell.product.name,
						description: ell.product.descrition,
						quantity: ell.quantity,
						unit_amount: {
							currency_code: 'USD',
							value: ell.price.toFixed(2),
						},
					})),
				},
			],
			application_context: {
				return_url: 'http://localhost:3000/return',
				cancel_url: 'http://localhost:3000/cancel',
			  },
		})

		const response = await client.execute(payment)

      /*
		const approvalLink = response.result.links.find(
			(link: { rel: string }) => link.rel === 'capture',
		)  //.href = 'https://api.sandbox.paypal.com/v2/checkout/orders/27400561W8785991S/capture'
  
		if (!approvalLink) {
			throw new Error('Payment подтверждения платежа не найдено');
		}
	   */

		return {
			order,
			id: response.result.id,
			status: '200',
			//paymentUrl: approvalLink.href
		}
	}
    //...........................................


	/* 1) Понять какой статус 2)Подтвердить статус заказа  3)Поменяь статус платежа  */
	
	/*
	async updateStatus(dto: PaymentStatusDto){
	// Проверка на подтверждения
	if(dto.event !== "payment.waiting_for_capture") return
  // подтверждения и завершения платежа,
	const payment = await client.
	}

*/
	async updateStatus(orderId: string): Promise<any> {
		const request = new paypal.orders.OrdersCaptureRequest(orderId);
		request.requestBody({});
	
		try {
		  const response = await client.execute(request);
		  return response.result;
		} catch (error) {
		  console.error(error);
		  throw new Error('Payment capture failed');
		}
	  }
	


     // ..........................................
	async deleteOrder(id: number) {
		return this.prisma.order.delete({
			where: { id: id },
		})
	}
}
