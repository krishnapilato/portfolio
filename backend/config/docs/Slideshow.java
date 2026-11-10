import module java.desktop;

import org.w3c.dom.Node;

/// Turns screenshots into one looping GIF for the README, where GitHub runs no scripts.
/// java config/docs/Slideshow.java docs/screenshots/slideshow.gif docs/screenshots/*.png

static final int WIDTH = 1200;
static final int HEIGHT = 750;
static final String SECONDS_PER_SLIDE = "300";

void main(String... args) throws IOException {
    var writer = ImageIO.getImageWritersBySuffix("gif").next();
    try (var output = ImageIO.createImageOutputStream(Files.newOutputStream(Path.of(args[0])))) {
        writer.setOutput(output);
        writer.prepareWriteSequence(null);
        for (var file : Arrays.copyOfRange(args, 1, args.length)) {
            var frame = fit(ImageIO.read(Path.of(file).toFile()));
            var parameters = writer.getDefaultWriteParam();
            var metadata = writer.getDefaultImageMetadata(ImageTypeSpecifier.createFromRenderedImage(frame), parameters);
            loop(metadata);
            writer.writeToSequence(new IIOImage(frame, null, metadata), parameters);
            IO.println("[slideshow] " + file);
        }
        writer.endWriteSequence();
    }
}

BufferedImage fit(BufferedImage source) {
    var frame = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
    var scale = Math.min((double) WIDTH / source.getWidth(), (double) HEIGHT / source.getHeight());
    var width = (int) Math.round(source.getWidth() * scale);
    var height = (int) Math.round(source.getHeight() * scale);
    var graphics = frame.createGraphics();
    graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
    graphics.setColor(new Color(0xf7f6f3));
    graphics.fillRect(0, 0, WIDTH, HEIGHT);
    graphics.drawImage(source, (WIDTH - width) / 2, (HEIGHT - height) / 2, width, height, null);
    graphics.dispose();
    return frame;
}

void loop(IIOMetadata metadata) throws IIOInvalidTreeException {
    var format = metadata.getNativeMetadataFormatName();
    var root = (IIOMetadataNode) metadata.getAsTree(format);
    var control = child(root, "GraphicControlExtension");
    control.setAttribute("disposalMethod", "none");
    control.setAttribute("userInputFlag", "FALSE");
    control.setAttribute("transparentColorFlag", "FALSE");
    control.setAttribute("delayTime", SECONDS_PER_SLIDE);
    control.setAttribute("transparentColorIndex", "0");
    var repeat = new IIOMetadataNode("ApplicationExtension");
    repeat.setAttribute("applicationID", "NETSCAPE");
    repeat.setAttribute("authenticationCode", "2.0");
    repeat.setUserObject(new byte[] {1, 0, 0});
    child(root, "ApplicationExtensions").appendChild(repeat);
    metadata.setFromTree(format, root);
}

IIOMetadataNode child(IIOMetadataNode parent, String name) {
    for (Node node = parent.getFirstChild(); node != null; node = node.getNextSibling())
        if (node.getNodeName().equals(name)) return (IIOMetadataNode) node;
    var created = new IIOMetadataNode(name);
    parent.appendChild(created);
    return created;
}
