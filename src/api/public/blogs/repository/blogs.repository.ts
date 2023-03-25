import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { UpdateBanBlogDto } from '../dto/update-ban-blog.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  // -------------------------------------------------------------------------- //
  async getBlogsWithPagination(
    pageNumber,
    pageSize,
    searchNameTerm,
    sortBy,
    sortDirection,
  ) {
    const countQuery = `
      SELECT COUNT(*)
      FROM public."Blogs"
      WHERE ("Blogs"."name" ilike $1)
  `;
    const countResult = await this.dataSource.query(countQuery, [
      '%' + searchNameTerm + '%',
    ]);

    const dataQuery = `
      SELECT *
        FROM public."Blogs"
        WHERE ("Blogs"."name" ilike $1)
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY
      `;

    const dataResult = await this.dataSource.query(dataQuery, [
      '%' + searchNameTerm + '%',
      (pageNumber - 1) * pageSize,
      pageSize,
    ]);
    const pages = Math.ceil(countResult[0].count / pageSize);

    const mappedBlogs = dataResult.map((obj) => {
      return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        websiteUrl: obj.websiteUrl,
        createdAt: obj.createdAt,
        isMembership: obj.isMembership,
      };
    });
    return {
      pagesCount: pages,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +countResult[0].count,
      items: mappedBlogs,
    };
  }
  // -------------------------------------------------------------------------- //
  async getAllBlogsWithOwnerInfo(
    searchNameTerm: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: any,
  ) {
    const dataQuery = `
      SELECT *
      FROM public."Blogs"
      LEFT JOIN "Blog_ban_info" ON "Blog_ban_info"."userId" = "Blogs"."userId"
      WHERE ("name" ilike $1 AND "isBanned" = false)
      ORDER BY "${sortBy}" ${sortDirection}
      OFFSET $3 ROWS FETCH NEXT $2 ROWS ONLY
  `;
    const dataResult = await this.dataSource.query(dataQuery, [
      '%' + searchNameTerm + '%',
      pageSize,
      (pageNumber - 1) * pageSize,
    ]);

    const mappedBlogs = dataResult.map((obj) => {
      return {
        id: obj.blogId,
        name: obj.name,
        description: obj.description,
        websiteUrl: obj.websiteUrl,
        createdAt: obj.createdAt,
        isMembership: obj.isMembership,
        blogOwnerInfo: {
          userId: obj.userId,
          userLogin: obj.userLogin,
        },
        banInfo: {
          isBanned: obj.isBanned,
          banDate: obj.banDate,
        },
      };
    });
    return mappedBlogs;
  }
  // -------------------------------------------------------------------------- //
  async createBlog(
    dto: CreateBlogDto,
    userId: string,
    userLogin: string,
    createdAt: string,
  ) {
    const query = `
        WITH inserted_blog AS (
          INSERT INTO public."Blogs"("name", "description", "websiteUrl", "createdAt", "isMembership", "userId", "userLogin")
          VALUES ($1, $2, $3, $4, false, $5, $6)
          RETURNING id
        )
          INSERT INTO public."Blog_ban_info"("isBanned", "banDate", "userId", "blogId")
          VALUES (false, null, $5, (SELECT id FROM inserted_blog))
          RETURNING (SELECT * FROM inserted_blog)
    `;
    const res = await this.dataSource.query(query, [
      dto.name,
      dto.description,
      dto.websiteUrl,
      createdAt,
      userId,
      userLogin,
    ]);
    return res[0].id
  }
  // -------------------------------------------------------------------------- //
  async getAllBlogInfoById(blogId: string) {
    const query = `SELECT *
      FROM "Blogs"
      WHERE "Blogs"."id" = $1;
    `;
    return await this.dataSource.query(query, [blogId]);
  }
  // -------------------------------------------------------------------------- //
  async deleteBlogById(blogId: string) {
    const query = `DELETE FROM "Blogs" WHERE "id" = $1`;
    return await this.dataSource.query(query, [blogId]);
  }
  // -------------------------------------------------------------------------- //
  async updateBlogById(dto: UpdateBlogDto, blogId: string) {
    const query = `
     UPDATE "Blogs" 
     SET "name" = $1, "description" = $2, "websiteUrl" = $3
     WHERE "id" = $4
    `;
    return await this.dataSource.query(query, [
      dto.name,
      dto.description,
      dto.websiteUrl,
      blogId,
    ]);
  }
  // -------------------------------------------------------------------------- //
  async unbanBlog(id: string, dto: UpdateBanBlogDto) {
    const query = `
     UPDATE "Blog_ban_info" 
     SET "isBanned" = $2, "banDate" = null
     WHERE "blogId" = $1
    `;
    return await this.dataSource.query(query, [id, dto.isBanned]);
  }
  // -------------------------------------------------------------------------- //
  async banBlog(id: string, dto: UpdateBanBlogDto, banDate: string) {
    const query = `
     UPDATE "Blog_ban_info" 
     SET "isBanned" = $2, "banDate" = $3
     WHERE "blogId" = $1
    `;
    return await this.dataSource.query(query, [id, dto.isBanned, banDate]);
  }
  // -------------------------------------------------------------------------- //
  async countBlogs(searchNameTerm) {
    const query = `
      SELECT COUNT(*)
      FROM "Blogs"
      LEFT JOIN "Blog_ban_info" ON "Blogs"."userId" = "Blog_ban_info"."userId"
      WHERE ("Blogs"."name" ilike $1)
  `;
    const res = await this.dataSource.query(query, [
      '%' + searchNameTerm + '%',
    ]);
    const count = Number(res[0].count);
    return count;
  }
  // -------------------------------------------------------------------------- //
  async countBlogsForOwner(searchNameTerm: string, userId: string) {
    const query = `
      SELECT COUNT(*)
      FROM "Blogs"
      WHERE ("Blogs"."name" ilike $1 AND "Blogs"."userId" = $2)
  `;
    const res = await this.dataSource.query(query, [
      '%' + searchNameTerm + '%',
      userId,
    ]);
    const count = Number(res[0].count);
    return count;
  }
  // -------------------------------------------------------------------------- //
  async getAllBlogsForOwner(
    searchNameTerm: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string,
  ) {
    const countQuery = `
      SELECT COUNT(*)
      FROM public."Blogs"
      WHERE ("Blogs"."name" ilike $1 AND "Blogs"."userId" = $2)
  `;
    const countResult = await this.dataSource.query(countQuery, [
      '%' + searchNameTerm + '%',
      userId,
    ]);

    const dataQuery = `
      SELECT *
        FROM public."Blogs"
        WHERE ("Blogs"."name" ilike $1 AND "Blogs"."userId" = $2)
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $3 ROWS FETCH NEXT $4 ROWS ONLY
      `;

    const dataResult = await this.dataSource.query(dataQuery, [
      '%' + searchNameTerm + '%',
      userId,
      (pageNumber - 1) * pageSize,
      pageSize,


    ]);
    const pages = Math.ceil(countResult[0].count / pageSize);

    const mappedBlogs = dataResult.map((obj) => {
      return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        websiteUrl: obj.websiteUrl,
        createdAt: obj.createdAt,
        isMembership: obj.isMembership,
      };
    });
    return {
      pagesCount: pages,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +countResult[0].count,
      items: mappedBlogs,
    };
  }
  // -------------------------------------------------------------------------- //
  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."Blogs";`);
    return await this.dataSource.query(`DELETE FROM public."Blog_ban_info";`);
  }
}
