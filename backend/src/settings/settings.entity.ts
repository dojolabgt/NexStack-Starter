import {
    Entity,
    PrimaryColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity('app_settings')
export class AppSettings {
    @PrimaryColumn({ default: 1 })
    id: number; // Singleton pattern - always ID=1

    @Column({ default: 'Dashboard App' })
    appName: string;

    @Column({ nullable: true })
    appLogo: string; // URL to logo image

    @Column({ nullable: true })
    appFavicon: string; // URL to favicon

    @Column({ default: '#3B82F6' })
    primaryColor: string; // Hex color

    @Column({ default: '#10B981' })
    secondaryColor: string; // Hex color

    @Column({ default: true })
    allowRegistration: boolean;

    @Column({ default: false })
    maintenanceMode: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
