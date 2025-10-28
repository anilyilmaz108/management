import { UserRole } from 'src/common/enum/roles.enum';
import { Post } from 'src/modules/post/entity/post.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  age: number;

  @Column({
    type: 'int',
    default: UserRole.MUSTERI,
  })
  role: UserRole;

  @Column({ nullable: true })
  tempRole?: number;

  @Column({ nullable: true })
  tempRoleDate?: Date;

  @Column()
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}

/**
 * ROLE
 1- Yönetici
 2- Çalışan
 3- Müşteri
 4- Admin

 Zamanla artabilir şimdilik bu yeterli
 */
