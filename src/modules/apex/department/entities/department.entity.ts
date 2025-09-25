import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'department' })
export class Department {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 255, nullable: true })
    description?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
