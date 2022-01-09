import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Card } from './models/card.entity';
import { User } from 'src/user/models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { UserCard } from './models/user-card.entity';
import { BoardService } from 'src/board/board.service';
import { CreateCardDto } from './dtos/request-dtos/create-card.dto';
import { AssignCardDto } from './dtos/request-dtos/assign-card.dto';
import { UpdateCardDto } from './dtos/request-dtos/update-card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(UserCard) private userCardRepo: Repository<UserCard>,
    @InjectRepository(Card) private cardRepo: Repository<Card>,
    private boardService: BoardService,
    private userService: UserService
  ) { }

  async create(createCardDto: CreateCardDto, user: User) {
    if (createCardDto.due_date_time && createCardDto.due_date_time.getTime() <= new Date().getTime())
      throw new BadRequestException('unaccepatable due date');

    const list = await this.boardService.findList(createCardDto.list_id);
    if (!list) throw new NotFoundException('list not found');

    if (!await this.boardService.memberCheck(user, (await list.board).board_id))
      throw new ForbiddenException();

    const card = this.cardRepo.create(createCardDto);
    card.creator = Promise.resolve(user);
    card.list = Promise.resolve(list);
    return this.cardRepo.save(card);
  }

  async assign(assignCardDto: AssignCardDto, user: User) {
    const card = await this.cardRepo.findOne(assignCardDto.card_id);
    if (!card) throw new NotFoundException('card not found');

    const assignedUser = await this.userService.findOne(assignCardDto.user_id);
    if (!assignedUser) throw new NotFoundException('assigned user not found');

    const userBoards = await this.userCardRepo.find({
      where: { user_id: assignedUser.user_id, card_id: card.card_id }
    });
    if (userBoards.length) throw new BadRequestException('already assigned');

    if (!await this.boardService.memberCheck(user, (await (await card.list).board).board_id))
      throw new ForbiddenException();

    if (!await this.boardService.memberCheck(assignedUser, (await (await card.list).board).board_id))
      throw new BadRequestException('user not in board');

    const userCard = this.userCardRepo.create(assignCardDto);
    return this.userCardRepo.save(userCard);
  }

  async findByBoard() {}

  async update(id: string, updateCardDto: UpdateCardDto, user: User) {
    const card = await this.cardRepo.findOne(id);
    if (!card) throw new NotFoundException('card not found');

    if (!await this.boardService.memberCheck(user, (await (await card.list).board).board_id))
    throw new ForbiddenException();

    if (updateCardDto.due_date_time) {
      if (updateCardDto.due_date_time.getTime() <= card.create_date_time.getTime())
        throw new BadRequestException('unaccepatable due date');

      card.due_date_time = updateCardDto.due_date_time;
    }

    card.title = updateCardDto.title;
    card.is_done = updateCardDto.is_done;

    return this.cardRepo.save(card);
  }
}
