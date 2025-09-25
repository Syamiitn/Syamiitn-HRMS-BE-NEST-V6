import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

// TypeORM and MySQL integration
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { configValidationSchema } from './config/validation';
import { ApexModule } from './modules/apex/apex.module';
import { AssetModule } from './modules/asset/asset.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ExitModule } from './modules/exit/exit.module';
import { LeaveModule } from './modules/leave/leave.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { AuthModule } from './modules/auth/auth.module';
import { CurrentUserMiddleware } from './common/middleware/current-user.middleware';
import { SeparationModule } from './modules/separation/separation.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
    }),
    // TypeORM configuration for MySQL
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'hrms_test_v1',
      autoLoadEntities: true,
      synchronize: false, // avoid destructive schema sync; use migrations
      migrationsRun: true,
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
    }),
    // Application modules
    ApexModule,
    AssetModule,
    AttendanceModule,
    EmployeeModule,
    ExitModule,
    LeaveModule,
    PayrollModule,
    AuthModule,
    SeparationModule,
    DocumentsModule,
    TemplatesModule,
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
