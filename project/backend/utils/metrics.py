import torch
import torch.nn as nn
from skimage.metrics import peak_signal_noise_ratio as psnr
from skimage.metrics import structural_similarity as ssim
import numpy as np

def calculate_psnr(img1, img2, data_range=1.0):
    """
    Computes PSNR between two images.
    Images should be NumPy arrays of shape (C, H, W) in range [0, 1].
    """
    # Convert to (H, W, C) for skimage
    img1 = np.transpose(img1, (1, 2, 0))
    img2 = np.transpose(img2, (1, 2, 0))
    return psnr(img1, img2, data_range=data_range)

def calculate_ssim(img1, img2, data_range=1.0):
    """
    Computes SSIM between two images.
    Images should be NumPy arrays of shape (C, H, W) in range [0, 1].
    """
    img1 = np.transpose(img1, (1, 2, 0))
    img2 = np.transpose(img2, (1, 2, 0))
    # win_size must be <= min dimension and odd. Usually 11 or 7.
    win_size = min(7, img1.shape[0], img1.shape[1])
    if win_size % 2 == 0:
        win_size -= 1
        
    return ssim(img1, img2, data_range=data_range, channel_axis=-1, win_size=win_size)

def calculate_sam(img1, img2):
    """
    Computes Spectral Angle Mapper (SAM) between two multispectral images.
    Input shape: (C, H, W)
    """
    # Avoid division by zero
    epsilon = 1e-8
    
    dot_product = np.sum(img1 * img2, axis=0)
    norm1 = np.linalg.norm(img1, axis=0)
    norm2 = np.linalg.norm(img2, axis=0)
    
    cos_theta = dot_product / (norm1 * norm2 + epsilon)
    # Clip to valid domain for arccos to prevent NaNs
    cos_theta = np.clip(cos_theta, -1.0, 1.0) 
    
    sam_map = np.arccos(cos_theta)
    return np.mean(sam_map)

class PerceptualLoss(nn.Module):
    def __init__(self):
        super(PerceptualLoss, self).__init__()
        from torchvision.models import vgg16
        vgg = vgg16(pretrained=True).features
        self.slice1 = torch.nn.Sequential()
        self.slice2 = torch.nn.Sequential()
        for x in range(4):
            self.slice1.add_module(str(x), vgg[x])
        for x in range(4, 9):
            self.slice2.add_module(str(x), vgg[x])
        for param in self.parameters():
            param.requires_grad = False

    def forward(self, x, y):
        # VGG expects 3 channels
        h_x = self.slice1(x)
        h_x = self.slice2(h_x)
        h_y = self.slice1(y)
        h_y = self.slice2(h_y)
        return torch.nn.functional.mse_loss(h_x, h_y)
