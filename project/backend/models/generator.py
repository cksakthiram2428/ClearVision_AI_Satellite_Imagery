import torch
import torch.nn as nn
import torch.nn.functional as F

class AttentionBlock(nn.Module):
    def __init__(self, F_g, F_l, F_int):
        super(AttentionBlock, self).__init__()
        self.W_g = nn.Sequential(
            nn.Conv2d(F_g, F_int, kernel_size=1, stride=1, padding=0, bias=True),
            nn.BatchNorm2d(F_int)
        )
        self.W_x = nn.Sequential(
            nn.Conv2d(F_l, F_int, kernel_size=1, stride=1, padding=0, bias=True),
            nn.BatchNorm2d(F_int)
        )
        self.psi = nn.Sequential(
            nn.Conv2d(F_int, 1, kernel_size=1, stride=1, padding=0, bias=True),
            nn.BatchNorm2d(1),
            nn.Sigmoid()
        )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, g, x):
        g1 = self.W_g(g)
        x1 = self.W_x(x)
        psi = self.relu(g1 + x1)
        psi = self.psi(psi)
        return x * psi

class Generator(nn.Module):
    def __init__(self, in_channels=3, out_channels=3):
        """
        Attention U-Net implementation. 
        Note: For hackathon speed, we use a basic custom Attention U-Net here. 
        In full deployment, this can wrap `segmentation_models_pytorch.Unet`.
        """
        super(Generator, self).__init__()
        
        self.Maxpool = nn.MaxPool2d(kernel_size=2, stride=2)
        
        self.Conv1 = self._conv_block(in_channels, 64)
        self.Conv2 = self._conv_block(64, 128)
        self.Conv3 = self._conv_block(128, 256)
        self.Conv4 = self._conv_block(256, 512)
        
        self.Up4 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.Att4 = AttentionBlock(F_g=256, F_l=256, F_int=128)
        self.Up_conv4 = self._conv_block(512, 256)
        
        self.Up3 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.Att3 = AttentionBlock(F_g=128, F_l=128, F_int=64)
        self.Up_conv3 = self._conv_block(256, 128)
        
        self.Up2 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.Att2 = AttentionBlock(F_g=64, F_l=64, F_int=32)
        self.Up_conv2 = self._conv_block(128, 64)
        
        self.Conv_1x1 = nn.Conv2d(64, out_channels, kernel_size=1, stride=1, padding=0)

    def _conv_block(self, in_ch, out_ch):
        return nn.Sequential(
            nn.Conv2d(in_ch, out_ch, kernel_size=3, stride=1, padding=1, bias=True),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, kernel_size=3, stride=1, padding=1, bias=True),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        e1 = self.Conv1(x)
        
        e2 = self.Maxpool(e1)
        e2 = self.Conv2(e2)
        
        e3 = self.Maxpool(e2)
        e3 = self.Conv3(e3)
        
        e4 = self.Maxpool(e3)
        e4 = self.Conv4(e4)
        
        d4 = self.Up4(e4)
        x3 = self.Att4(g=d4, x=e3)
        d4 = torch.cat((x3, d4), dim=1)
        d4 = self.Up_conv4(d4)
        
        d3 = self.Up3(d4)
        x2 = self.Att3(g=d3, x=e2)
        d3 = torch.cat((x2, d3), dim=1)
        d3 = self.Up_conv3(d3)
        
        d2 = self.Up2(d3)
        x1 = self.Att2(g=d2, x=e1)
        d2 = torch.cat((x1, d2), dim=1)
        d2 = self.Up_conv2(d2)
        
        out = self.Conv_1x1(d2)
        return torch.sigmoid(out) # Outputs normalized values [0, 1]
