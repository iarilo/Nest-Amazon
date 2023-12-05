import { PrismaClient, Product } from '@prisma/client';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { min } from 'class-validator';






dotenv.config();
const prisma = new PrismaClient();

//  Продукты и категорий которые надо сгенерировать
const createProduct = async (quatity: number) => {
  const products: Product[] = [];

 

  for (let i = 0; i < quatity; i++) {
    const productName = faker.commerce.productName();
    const categoryName = faker.commerce.department();

    const newProduct = await prisma.product.create({
      data: {
        name: productName,
        slug: faker.helpers.slugify(productName).toLowerCase(),
        descrition: faker.commerce.productDescription(),
        prise: +faker.commerce.price({ min: 10, max: 999, dec: 0 }),
        images: Array.from({
          length: faker.number.float({ min: 2, max: 6 }),
        }).map(() => faker.image.url({width:500, height:500})),

        category: {
          create: {
            name: categoryName,
            slug:  faker.helpers.slugify(productName).toLowerCase(),
          },
        },
        reviews: {
          // 1  отзов
          create: [
            {
              rating: faker.number.float({ min: 1, max: 5 }),
              text: faker.lorem.paragraph(),
             
              newuser: {
                connect: {
                  id: 14,
                },
              },
            },
            // 2  отзов
            {
              rating: faker.number.float({ min: 1, max: 5 }),
              text: faker.lorem.paragraph(),
             
              newuser: {
                connect: {
                  id: 15,
                },
              },
            },
            


          ],
        },

        newuser: {
          connect: {
            id: 16,
          },
        },
      
      },
    });
    products.push(newProduct);
   
  }
 
  console.log(`Created  ${products.length} product`);
};

// Количество товаров
async function main() {
  console.log('Старт функции createProduct ');
  await createProduct(10);
}

//  Вывожу ошибку и закрываю базу данных
main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });



