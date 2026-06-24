import numpy as np
import rasterio
from rasterio.transform import from_origin

# Create a 1x1 pixel array (white)
arr = np.full((1, 1), 255, dtype=np.uint8)

# Simple geotransform (origin at 0,0, pixel size 1)
transform = from_origin(0, 0, 1, 1)

out_path = "sample.tif"

with rasterio.open(
    out_path,
    "w",
    driver="GTiff",
    height=arr.shape[0],
    width=arr.shape[1],
    count=1,
    dtype=arr.dtype,
    crs="EPSG:4326",
    transform=transform,
) as dst:
    dst.write(arr, 1)

print(f"Dummy GeoTIFF created at {out_path}")
