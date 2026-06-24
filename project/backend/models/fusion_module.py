import torch
import torch.nn as nn

class FusionModule(nn.Module):
    def __init__(self, liss_channels=3, sar_channels=2, temporal_channels=3, mask_channels=1, out_channels=3):
        """
        Fuses LISS-IV optical data with Sentinel-1 SAR, Temporal reference, and the cloud mask.
        """
        super(FusionModule, self).__init__()
        
        in_channels = liss_channels + sar_channels + temporal_channels + mask_channels
        
        self.fusion_block = nn.Sequential(
            nn.Conv2d(in_channels, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            
            nn.Conv2d(64, out_channels, kernel_size=1) # Reduce back to 3 channels for backbone
        )

    def forward(self, liss, sar, temporal, mask):
        # Concatenate all modalities along the channel dimension
        x = torch.cat([liss, sar, temporal, mask], dim=1)
        return self.fusion_block(x)
