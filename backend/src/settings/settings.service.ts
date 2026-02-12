import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from './settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { StorageService } from '../storage/storage.service';
import { storageConfig } from '../storage/storage.config';

@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    constructor(
        @InjectRepository(AppSettings)
        private readonly settingsRepository: Repository<AppSettings>,
        private readonly storageService: StorageService,
    ) { }

    /**
     * Get app settings (creates default if not exists)
     */
    async getSettings(): Promise<AppSettings> {
        let settings = await this.settingsRepository.findOne({ where: { id: 1 } });

        if (!settings) {
            this.logger.log('Creating default app settings');
            settings = this.settingsRepository.create({
                id: 1,
                appName: 'NexStack-App',
                appLogo: '/public/branding/NexLogo.png',
                appFavicon: '/public/branding/favicon.ico',
                primaryColor: '#3B82F6',
                secondaryColor: '#10B981',
                allowRegistration: true,
                maintenanceMode: false,
            });
            await this.settingsRepository.save(settings);
        }

        return settings;
    }

    /**
     * Update app settings
     */
    async updateSettings(dto: UpdateSettingsDto): Promise<AppSettings> {
        await this.settingsRepository.update(1, dto);
        return this.getSettings();
    }

    /**
     * Upload app asset (logo or favicon)
     */
    async uploadAsset(
        file: Express.Multer.File,
        type: 'logo' | 'favicon',
    ): Promise<AppSettings> {
        // Get current settings to delete old asset
        const settings = await this.getSettings();
        const oldAssetUrl = type === 'logo' ? settings.appLogo : settings.appFavicon;

        // Delete old asset if exists
        if (oldAssetUrl) {
            try {
                await this.storageService.delete(oldAssetUrl);
            } catch (error) {
                this.logger.warn(`Failed to delete old ${type}:`, error.message);
            }
        }

        // Upload new asset
        const uploadResult = await this.storageService.upload(
            file,
            storageConfig.folders.appAssets || 'app-assets',
        );

        // Update settings with new asset URL
        const updateData: Partial<AppSettings> = {};
        if (type === 'logo') {
            updateData.appLogo = uploadResult.url;
        } else {
            updateData.appFavicon = uploadResult.url;
        }

        await this.settingsRepository.update(1, updateData);
        return this.getSettings();
    }
}
