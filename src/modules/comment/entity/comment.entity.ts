import { Post } from 'src/modules/post/entity/post.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  comment: string;

  @ManyToOne(() => Post, (post) => post.comments)
  post: Post;

  @DeleteDateColumn({nullable:true})
  deletedAt?:Date
}
