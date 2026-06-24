import os
import yaml
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter
from tqdm import tqdm

from models.generator import Generator
from models.discriminator import Discriminator
from models.fusion_module import FusionModule
from datasets.liss_dataset import LISSDataset
from utils.metrics import PerceptualLoss

def train():
    with open('config/config.yaml', 'r') as f:
        config = yaml.safe_load(f)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Initialize models
    fusion = FusionModule(liss_channels=3, sar_channels=2, temporal_channels=3, mask_channels=1, out_channels=3).to(device)
    generator = Generator(in_channels=3, out_channels=3).to(device)
    discriminator = Discriminator(in_channels=6).to(device)

    # Losses
    criterion_GAN = nn.BCEWithLogitsLoss()
    criterion_L1 = nn.L1Loss()
    criterion_perceptual = PerceptualLoss().to(device)
    
    # Optimizers
    optimizer_G = optim.Adam(list(generator.parameters()) + list(fusion.parameters()), lr=config['learning_rate'], betas=(0.5, 0.999))
    optimizer_D = optim.Adam(discriminator.parameters(), lr=config['learning_rate'], betas=(0.5, 0.999))

    # DataLoader setup (mock directories for illustration)
    dataset = LISSDataset(cloudy_dir='../data/cloudy', clear_dir='../data/clear', augment=True)
    # Using dummy length for initialization if folders don't exist yet
    if len(dataset) > 0:
        dataloader = DataLoader(dataset, batch_size=config['batch_size'], shuffle=True, num_workers=4)
    else:
        print("Warning: Empty dataset, skipping training loop execution for now.")
        return

    writer = SummaryWriter('logs/train')

    lambda_L1 = 100
    lambda_perc = 10

    for epoch in range(config['epochs']):
        generator.train()
        fusion.train()
        discriminator.train()
        
        loop = tqdm(dataloader, leave=True)
        for idx, batch in enumerate(loop):
            cloudy = batch['cloudy_image'].to(device)
            mask = batch['cloud_mask'].to(device)
            sar = batch['sar_image'].to(device)
            temporal = batch['reference_image'].to(device)
            target = batch['target_image'].to(device)

            # --- Train Generator ---
            optimizer_G.zero_grad()
            
            # Forward pass
            fused_input = fusion(cloudy, sar, temporal, mask)
            fake_img = generator(fused_input)
            
            # GAN Loss
            pred_fake = discriminator(fake_img, fused_input)
            loss_GAN = criterion_GAN(pred_fake, torch.ones_like(pred_fake))
            
            # L1 & Perceptual
            loss_L1 = criterion_L1(fake_img, target) * lambda_L1
            loss_perc = criterion_perceptual(fake_img, target) * lambda_perc
            
            loss_G = loss_GAN + loss_L1 + loss_perc
            loss_G.backward()
            optimizer_G.step()

            # --- Train Discriminator ---
            optimizer_D.zero_grad()
            
            pred_real = discriminator(target, fused_input)
            loss_real = criterion_GAN(pred_real, torch.ones_like(pred_real))
            
            pred_fake = discriminator(fake_img.detach(), fused_input)
            loss_fake = criterion_GAN(pred_fake, torch.zeros_like(pred_fake))
            
            loss_D = 0.5 * (loss_real + loss_fake)
            loss_D.backward()
            optimizer_D.step()

            # Logging
            writer.add_scalar('Loss/Generator', loss_G.item(), epoch * len(dataloader) + idx)
            writer.add_scalar('Loss/Discriminator', loss_D.item(), epoch * len(dataloader) + idx)
            
            loop.set_description(f"Epoch [{epoch}/{config['epochs']}]")
            loop.set_postfix(loss_G=loss_G.item(), loss_D=loss_D.item())

        # Save Checkpoint
        os.makedirs(config['checkpoint_dir'], exist_ok=True)
        torch.save(generator.state_dict(), os.path.join(config['checkpoint_dir'], f'generator_epoch_{epoch}.pth'))
        torch.save(discriminator.state_dict(), os.path.join(config['checkpoint_dir'], f'discriminator_epoch_{epoch}.pth'))

if __name__ == '__main__':
    train()
