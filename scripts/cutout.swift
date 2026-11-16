// Person cutout using Apple's on-device Vision person segmentation.
// Usage: swift scripts/cutout.swift <input.jpg> <output.png> [height]
// Produces a small RGBA PNG (background transparent) that the site samples into particles.

import AppKit
import CoreImage
import CoreImage.CIFilterBuiltins
import Vision

let args = CommandLine.arguments
guard args.count >= 3 else {
  print("usage: swift cutout.swift <input> <output.png> [height]")
  exit(1)
}
let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])
let targetHeight = args.count > 3 ? Double(args[3]) ?? 320 : 320

guard let source = CIImage(contentsOf: input, options: [.applyOrientationProperty: true]) else {
  print("could not read \(input.path)")
  exit(1)
}

let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8

let handler = VNImageRequestHandler(ciImage: source, options: [:])
try handler.perform([request])
guard let maskBuffer = request.results?.first?.pixelBuffer else {
  print("no person found")
  exit(1)
}

// Scale the mask up to the photo, then use it as alpha.
var mask = CIImage(cvPixelBuffer: maskBuffer)
mask = mask.transformed(by: CGAffineTransform(
  scaleX: source.extent.width / mask.extent.width,
  y: source.extent.height / mask.extent.height))

let blend = CIFilter.blendWithMask()
blend.inputImage = source
blend.backgroundImage = CIImage(color: .clear).cropped(to: source.extent)
blend.maskImage = mask
guard var cut = blend.outputImage else { exit(1) }

// Downscale: the site only needs a few hundred pixels to place ~16k particles.
let scale = targetHeight / source.extent.height
cut = cut.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

let context = CIContext()
let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
try context.writePNGRepresentation(of: cut, to: output, format: .RGBA8, colorSpace: colorSpace)
print("wrote \(output.path) \(Int(cut.extent.width))x\(Int(cut.extent.height))")
