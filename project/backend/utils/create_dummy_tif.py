import numpy as np
import rasterio
from rasterio.transform import from_origin

# 1x1 pixel image with value 255 (white)
data = np.full((1, 1), 255, dtype=np.uint8)

# Simple georeferencing (origin at 0,0, pixel size 1x1)
transform = from_origin(0, 0, 1, 1)

output_path = "sample.tif"

with rasterio.open(
    output_path,
    "w",
    driver="GTiff",
    height=data.shape[0],
    width=data.shape[1],
    count=1,
    dtype=data.dtype,
    crs="EPSG:4326",
    transform=transform,
) as dst:
    dst.write(data, 1)

print(f"Created {output_path}")
