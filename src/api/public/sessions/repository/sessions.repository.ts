import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from '../dto/create-session.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  // --------------------------------------------------- //
  async create(session: CreateSessionDto) {
    const query = `
        INSERT INTO public."Session_info"("ip", "title", "deviceId", "lastActiveDate", "userId")
        VALUES ($1, $2, $3, $4, $5)
    `;
    return await this.dataSource.query(query, [
      session.ip,
      session.title,
      session.deviceId,
      session.lastActiveDate,
      session.userId,
    ]);
  }
  // --------------------------------------------------- //
  async getAllSessions(id: string) {
    const query = `
    SELECT * FROM public."Session_info" WHERE "userId" = $1
    `;
    return await this.dataSource.query(query, [id]);
  }
  // --------------------------------------------------- //
  //   async getSessionsByDeviceId(deviceId: string) {
  //   	return this.sessionsModel.findOne({ deviceId: deviceId }, { _id: 0 });
  //   }
  // --------------------------------------------------- //
  async deleteSessionByDeviceId(deviceId: string) {
    const query = `
  	DELETE FROM "Session_info"
    WHERE "deviceId" = $1
  	`;
    return await this.dataSource.query(query, [deviceId]);
  }
  // --------------------------------------------------- //
  async deleteAllSessionsWithExclude(deviceId: string, userId: string) {
    const query = `
        DELETE FROM "Session_info"
        WHERE "deviceId" <> $1 AND "userId" = $2
`;
    return await this.dataSource.query(query, [deviceId, userId]);
  }
  // --------------------------------------------------- //
  async deleteAllSessionForBanUser(userId: string) {
    const query = `
        DELETE FROM "Session_info"
        WHERE "userId" = $1
`;
    return await this.dataSource.query(query, [userId]);
  }
  // --------------------------------------------------- //
  async updateSessionAfterRefresh(deviceId: string, lastActiveDate: string) {
    const query = `
     UPDATE "Session_info" 
     SET "lastActiveDate" = $2 
     WHERE "deviceId" = $1
    `;
    return await this.dataSource.query(query, [deviceId, lastActiveDate]);
  }
  // --------------------------------------------------- //
  // async deleteAllSessionsWithExclude(deviceId: string, userId: string) {
  // 	return this.sessionsModel.deleteMany({ deviceId: { $ne: deviceId },  userId: userId} );
  // }
  //
  // async deleteAll() {
  // 	return this.sessionsModel.deleteMany().exec();
  // }
  // --------------------------------------------------- //
  async getSessionByDeviceId(deviceId: string) {
    const query = `SELECT *
      FROM "Session_info"
      WHERE "deviceId" = $1
    `;
    return await this.dataSource.query(query, [deviceId]);
  }
  // --------------------------------------------------- //
  async getSessionByUserAndDeviceIdAndLastActiveDate(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ) {
    const query = `SELECT *
      FROM "Session_info"
      WHERE "userId" = $1
      AND "deviceId" = $2
      AND "lastActiveDate" = $3
    `;
    return await this.dataSource.query(query, [
      userId,
      deviceId,
      lastActiveDate,
    ]);
  }
  // --------------------------------------------------- //
  // deleteAllSessionForBanUser(id: string) {
  // 	return this.sessionsModel.deleteMany({ userId: id} );
  // }
  // --------------------------------------------------- //
  async deleteAll() {
    return await this.dataSource.query(`DELETE FROM public."Session_info";`);
  }
  // --------------------------------------------------- //

}
