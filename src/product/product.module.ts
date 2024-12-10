import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from 'src/prisma.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { CategoryService } from 'src/category/category.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    PrismaService,
    PaginationService,
    CategoryService,
    JwtService,
 ],
 imports:[AuthModule]

})
export class ProductModule {}
