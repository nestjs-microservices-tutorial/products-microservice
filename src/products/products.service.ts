import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('productsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('database connected');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalProducts = await this.product.count();
    const lastPage = Math.ceil(totalProducts / limit);

    return {
      data: await this.product.findMany({
        take: limit,
        skip: (page - 1) * limit,
        where: {
          available: true,
        },
      }),
      meta: {
        total: totalProducts,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {
        id,
        available: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with the id ${id} not found`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const { id: _, ...data } = updateProductDto;
    const product = this.product.findUnique({
      where: {
        id: id,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product ${id}, not found`);
    }
    return this.product.update({
      where: {
        id: id,
      },
      data: data,
    });
  }

  remove(id: number) {
    const product = this.product.findUnique({
      where: {
        id,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found.`);
    }
    return this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
  }
}
