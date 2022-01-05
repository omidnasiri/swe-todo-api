import {
  Module,
  ValidationPipe,
  MiddlewareConsumer
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CardModule } from './card/card.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/models/user.entity';
import { Card } from './card/models/card.entity';
import { List } from './board/models/list.entity';
import { BoardModule } from './board/board.module';
import { Board } from './board/models/board.entity';
import { UserCard } from './card/models/user-card.entity';
import { UserBoard } from './board/models/user-board.entity';
const cookieSession = require('cookie-session');

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [
        User,
        List,
        Card,
        Board,
        UserCard,
        UserBoard
      ],
      synchronize: true
    }),
    UserModule,
    AuthModule,
    CardModule,
    BoardModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true
      })
    }
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['COOKIE_KEY']
        })
      )
      .forRoutes('*');
  }
}
