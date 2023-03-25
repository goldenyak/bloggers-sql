import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreatePostsDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  // -------------------------------------------------------------------------- //
  async getPostsWithPagination(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string) {
    const dataQuery = `
      SELECT *
        FROM public."Posts"
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $1 ROWS FETCH NEXT $2 ROWS ONLY
      `;

    const dataResult = await this.dataSource.query(dataQuery, [
      (pageNumber - 1) * pageSize,
      pageSize,
    ]);
    const mappedPosts = dataResult.map((obj) => {
      return {
        id: obj.id,
        title: obj.title,
        shortDescription: obj.shortDescription,
        content: obj.content,
        blogId: obj.blogId,
        blogName: obj.blogName,
        createdAt: obj.createdAt,
      };
    });
    return mappedPosts
  }
  // -------------------------------------------------------------------------- //
  async getAllPostsByBlogId(
    pageNumber: number,
    pageSize: number,
    searchNameTerm: string,
    sortBy: string,
    sortDirection: string,
    blogId: string,
  ) {
    const dataQuery = `
      SELECT *
        FROM public."Posts"
        WHERE ("Posts"."blogId" = $1)
        ORDER BY "${sortBy}" ${sortDirection}
        OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY
  `;

    const dataResult = await this.dataSource.query(dataQuery, [
      blogId,
      (pageNumber - 1) * pageSize,
      pageSize,
    ]);
    const mappedPosts = dataResult.map((obj) => {
      return {
        id: obj.id,
        title: obj.title,
        shortDescription: obj.shortDescription,
        content: obj.content,
        blogId: obj.blogId,
        blogName: obj.blogName,
        createdAt: obj.createdAt,
      };
    });
    return mappedPosts
  }
  // -------------------------------------------------------------------------- //
  async countAllPosts() {
    const countQuery = `
      SELECT COUNT(*)
      FROM public."Posts"
  `;
    const countResult = await this.dataSource.query(countQuery);;
    return countResult[0].count
  }
  // -------------------------------------------------------------------------- //
  async countPostForBlog(blogId: any) {
    const countQuery = `
      SELECT COUNT(*)
      FROM public."Posts"
      WHERE ("Posts"."blogId" = $1)
  `;
    const countResult = await this.dataSource.query(countQuery, [blogId]);
    return countResult[0].count
  }
  // -------------------------------------------------------------------------- //
  async createPost(
    dto: CreatePostsDto,
    userId: string,
    createdAt: string,
    blogId: string,
    blogName: string,
  ) {
    const query = `
        WITH inserted_post AS (
          INSERT INTO public."Posts"("title", "shortDescription", "content", "createdAt", "blogId", "blogName", "userId")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        )
        SELECT id FROM inserted_post;
    `;
    const result = await this.dataSource.query(query, [
      dto.title,
      dto.shortDescription,
      dto.content,
      createdAt,
      blogId,
      blogName,
      userId,
    ]);
    return result[0];
  }
  // -------------------------------------------------------------------------- //
  async getAllPostInfoById(postId: string) {
    const query = `SELECT *
      FROM "Posts"
      WHERE "Posts"."id" = $1;
    `;
    return await this.dataSource.query(query, [postId]);
  }
  // -------------------------------------------------------------------------- //
  async deletePostById(postId: string) {
    const query = `DELETE FROM "Posts" WHERE "id" = $1`;
    return await this.dataSource.query(query, [postId]);
  }
  // -------------------------------------------------------------------------- //
  async updatePostById(dto: UpdatePostDto, postId: string) {
    const query = `
     UPDATE "Posts"
     SET "title" = $1, "shortDescription" = $2, "content" = $3
     WHERE "id" = $4
    `;
    return await this.dataSource.query(query, [
      dto.title,
      dto.shortDescription,
      dto.content,
      postId,
    ]);
  }
  // -------------------------------------------------------------------------- //
  async deleteAll() {
    return await this.dataSource.query(`DELETE FROM public."Posts";`);
  }

}
