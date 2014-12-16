#
# The Python Imaging Library.
# $Id$
#
# IFUNC IM file handling for PIL
#
# history:
# 1995-09-01 fl   Created.
# 1997-01-03 fl   Save palette images
# 1997-01-08 fl   Added sequence support
# 1997-01-23 fl   Added P and RGB save support
# 1997-05-31 fl   Read floating point images
# 1997-06-22 fl   Save floating point images
# 1997-08-27 fl   Read and save 1-bit images
# 1998-06-25 fl   Added support for RGB+LUT images
# 1998-07-02 fl   Added support for YCC images
# 1998-07-15 fl   Renamed offset attribute to avoid name clash
# 1998-12-29 fl   Added I;16 support
# 2001-02-17 fl   Use 're' instead of 'regex' (Python 2.1) (0.7)
# 2003-09-26 fl   Added LA/PA support
#
# Copyright (c) 1997-2003 by Secret Labs AB.
# Copyright (c) 1995-2001 by Fredrik Lundh.
#
# See the README file for information on usage and redistribution.
#


__version__ = "0.7"

import re
from . import Image, ImageFile, ImagePalette


# --------------------------------------------------------------------
# Standard tags

COMMENT = b"Comment"
DATE = b"Date"
EQUIPMENT = b"Digitalization equipment"
FRAMES = b"File size (no of images)"
LUT = b"Lut"
NAME = b"Name"
SCALE = b"Scale (x,y)"
SIZE = b"Image size (x*y)"
MODE = b"Image type"

TAGS = { COMMENT:0, DATE:0, EQUIPMENT:0, FRAMES:0, LUT:0, NAME:0,
         SCALE:0, SIZE:0, MODE:0 }

OPEN = {
    # ifunc93/p3cfunc formats
    b"0 1 image": ("1", "1"),
    b"L 1 image": ("1", "1"),
    b"Greyscale image": ("L", "L"),
    b"Grayscale image": ("L", "L"),
    b"RGB image": ("RGB", "RGB;L"),
    b"RLB image": ("RGB", "RLB"),
    b"RYB image": ("RGB", "RLB"),
    b"B1 image": ("1", "1"),
    b"B2 image": ("P", "P;2"),
    b"B4 image": ("P", "P;4"),
    b"X 24 image": ("RGB", "RGB"),
    b"L 32 S image": ("I", "I;32"),
    b"L 32 F image": ("F", "F;32"),
    # old p3cfunc formats
    b"RGB3 image": ("RGB", "RGB;T"),
    b"RYB3 image": ("RGB", "RYB;T"),
    # extensions
    b"LA image": ("LA", "LA;L"),
    b"RGBA image": ("RGBA", "RGBA;L"),
    b"RGBX image": ("RGBX", "RGBX;L"),
    b"CMYK image": ("CMYK", "CMYK;L"),
    b"YCC image": ("YCbCr", "YCbCr;L"),
}

# ifunc95 extensions
for i in ["8", "8S", "16", "16S", "32", "32F"]:
    OPEN[bytes("L %s image" % i, 'ascii')] = ("F", "F;%s" % i)
    OPEN[bytes("L*%s image" % i, 'ascii')] = ("F", "F;%s" % i)
for i in ["16", "16L", "16B"]:
    OPEN[bytes("L %s image" % i, 'ascii')] = ("I;%s" % i, "I;%s" % i)
    OPEN[bytes("L*%s image" % i, 'ascii')] = ("I;%s" % i, "I;%s" % i)
for i in ["32S"]:
    OPEN[bytes("L %s image" % i, 'ascii')] = ("I", "I;%s" % i)
    OPEN[bytes("L*%s image" % i, 'ascii')] = ("I", "I;%s" % i)
for i in range(2, 33):
    OPEN[bytes("L*%s image" % i, 'ascii')] = ("F", "F;%s" % i)


# --------------------------------------------------------------------
# Read IM directory

split = re.compile(br"^([A-Za-z][^:]*):[ \t]*(.*)[ \t]*$")

def number(s):
    try:
        return int(s)
    except ValueError:
        return float(s)

##
# Image plugin for the IFUNC IM file format.

class ImImageFile(ImageFile.ImageFile):

    format = "IM"
    format_description = "IFUNC Image Memory"

    def _open(self):

        # Quick rejection: if there's not an LF among the first
        # 100 bytes, this is (probably) not a text header.

        if not b"\n" in self.fp.read(100):
            raise SyntaxError("not an IM file")
        self.fp.seek(0)

        n = 0

        # Default values
        self.info[MODE] = "L"
        self.info[SIZE] = (512, 512)
        self.info[FRAMES] = 1

        self.rawmode = "L"

        while 1:

            s = self.fp.read(1)

            # Some versions of IFUNC uses \n\r instead of \r\n...
            if s == b"\r":
                continue

            if not s or (s[0] == 0) or (s[0] == 26):
                break

            # FIXME: this may read whole file if not a text file
            s = s + self.fp.readline()

            if len(s) > 100:
                raise SyntaxError("not an IM file")

            if s[-2:] == b'\r\n':
                s = s[:-2]
            elif s[-1:] == b'\n':
                s = s[:-1]

            try:
                m = split.match(s)
            except re.error as v:
                raise SyntaxError("not an IM file")

            if m:

                k, v = m.group(1,2)

                # Convert value as appropriate
                if k in [FRAMES, SCALE, SIZE]:
                    v = v.replace(b"*", b",")
                    v = tuple(map(number, v.split(b",")))
                    if len(v) == 1:
                        v = v[0]
                elif (k == MODE) and (v in OPEN):
                    v, self.rawmode = OPEN[v]

                # Add to dictionary. Note that COMMENT tags are
                # combined into a list of strings.
                if k == COMMENT:
                    if k in self.info:
                        self.info[k].append(v)
                    else:
                        self.info[k] = [v]
                else:
                    self.info[k] = v

                if k in TAGS:
                    n = n + 1

            else:

                raise SyntaxError("Syntax error in IM header: " + str(s))

        if not n:
            raise SyntaxError("Not an IM file")

        # Basic attributes
        self.size = self.info[SIZE]
        self.mode = self.info[MODE]

        # Skip forward to start of image data
        while s and (s[0] != 26):
            s = self.fp.read(1)
        if not s:
            raise SyntaxError("File truncated")

        if LUT in self.info:
            # convert lookup table to palette or lut attribute
            palette = self.fp.read(768)
            greyscale = 1 # greyscale palette
            linear = 1 # linear greyscale palette
            for i in range(256):
                if palette[i] == palette[i+256] == palette[i+512]:
                    if palette[i] != i:
                        linear = 0
                else:
                    greyscale = 0
            if self.mode == "L" or self.mode == "LA":
                if greyscale:
                    if not linear:
                        #self.lut = list(map(ord, palette[:256]))
                        self.lut = list(palette[:256])
                else:
                    if self.mode == "L":
                        self.mode = self.rawmode = "P"
                    elif self.mode == "LA":
                        self.mode = self.rawmode = "PA"
                    self.palette = ImagePalette.raw("RGB;L", palette)
            elif self.mode == "RGB":
                if not greyscale or not linear:
                    #self.lut = list(map(ord, palette))
                    self.lut = list(palette)

        self.frame = 0

        self.__offset = offs = self.fp.tell()

        self.__fp = self.fp # FIXME: hack

        if self.rawmode[:2] == "F;":

            # ifunc95 formats
            try:
                # use bit decoder (if necessary)
                bits = int(self.rawmode[2:])
                if bits not in [8, 16, 32]:
                    self.tile = [("bit", (0,0)+self.size, offs,
                                 (bits, 8, 3, 0, -1))]
                    return
            except ValueError:
                pass

        if self.rawmode in ["RGB;T", "RYB;T"]:
            # Old LabEye/3PC files.  Would be very surprised if anyone
            # ever stumbled upon such a file ;-)
            size = self.size[0] * self.size[1]
            self.tile = [("raw", (0,0)+self.size, offs, ("G", 0, -1)),
                         ("raw", (0,0)+self.size, offs+size, ("R", 0, -1)),
                         ("raw", (0,0)+self.size, offs+2*size, ("B", 0, -1))]
        else:
            # LabEye/IFUNC files
            self.tile = [("raw", (0,0)+self.size, offs, (self.rawmode, 0, -1))]

    def seek(self, frame):

        if frame < 0 or frame >= self.info[FRAMES]:
            raise EOFError("seek outside sequence")

        if self.frame == frame:
            return

        self.frame = frame

        if self.mode == "1":
            bits = 1
        else:
            bits = 8 * len(self.mode)

        size = ((self.size[0] * bits + 7) // 8) * self.size[1]
        offs = self.__offset + frame * size

        self.fp = self.__fp

        self.tile = [("raw", (0,0)+self.size, offs, (self.rawmode, 0, -1))]

    def tell(self):

        return self.frame

#
# --------------------------------------------------------------------
# Save IM files

SAVE = {
    # mode: (im type, raw mode)
    "1": ("0 1", "1"),
    "L": ("Greyscale", "L"),
    "LA": ("LA", "LA;L"),
    "P": ("Greyscale", "P"),
    "PA": ("LA", "PA;L"),
    "I": ("L 32S", "I;32S"),
    "I;16": ("L 16", "I;16"),
    "I;16L": ("L 16L", "I;16L"),
    "I;16B": ("L 16B", "I;16B"),
    "F": ("L 32F", "F;32F"),
    "RGB": ("RGB", "RGB;L"),
    "RGBA": ("RGBA", "RGBA;L"),
    "RGBX": ("RGBX", "RGBX;L"),
    "CMYK": ("CMYK", "CMYK;L"),
    "YCbCr": ("YCC", "YCbCr;L")
}

def _save(im, fp, filename, check=0):

    try:
        type, rawmode = SAVE[im.mode]
    except KeyError:
        raise ValueError("Cannot save %s images as IM" % im.mode)

    try:
        frames = im.encoderinfo["frames"]
    except KeyError:
        frames = 1

    if check:
        return check

    fp.write(bytes("Image type: %s image\r\n" % type, encoding='ascii'))
    if filename:
        fp.write(b"Name: " + bytes(filename, encoding='utf8') + b"\r\n")
    fp.write(bytes("Image size (x*y): %d*%d\r\n" % im.size, encoding='ascii'))
    fp.write(bytes("File size (no of images): %d\r\n" % frames,
        encoding='ascii'))
    if im.mode == "P":
        fp.write(b"Lut: 1\r\n")
    fp.write(b"\000" * (511-fp.tell()) + b"\032")
    if im.mode == "P":
        fp.write(im.im.getpalette("RGB", "RGB;L")) # 768 bytes
    ImageFile._save(im, fp, [("raw", (0,0)+im.size, 0, (rawmode, 0, -1))])

#
# --------------------------------------------------------------------
# Registry

Image.register_open("IM", ImImageFile)
Image.register_save("IM", _save)

Image.register_extension("IM", ".im")
