# Portions copyright © 2005-2009 Stephen John Machin, Lingfo Pty Ltd
# This module is part of the xlrd3 package, which is released under a
# BSD-style licence.

# 2009-05-31 SJM Fixed problem with no CODEPAGE record on extremely minimal BIFF2.x 3rd-party file
# 2009-04-27 SJM Integrated on_demand patch by Armando Serrano Lombillo
# 2008-02-09 SJM Excel 2.0: build XFs on the fly from cell attributes
# 2007-12-04 SJM Added support for Excel 2.x (BIFF2) files.
# 2007-10-11 SJM Added missing entry for blank cell type to ctype_text
# 2007-07-11 SJM Allow for BIFF2/3-style FORMAT record in BIFF4/8 file
# 2007-04-22 SJM Remove experimental "trimming" facility.

#for debugging only
from math import isnan

import time
from struct import unpack
from array import array

from .biffh import *
from .formula import dump_formula, decompile_formula, rangename2d
from .formatting import nearest_colour_index, Format
from .xfcell import XFCell

DEBUG = 0
OBJ_MSO_DEBUG = 0

_WINDOW2_options = (
    # Attribute names and initial values to use in case
    # a WINDOW2 record is not written.
    ("show_formulas", 0),
    ("show_grid_lines", 1),
    ("show_sheet_headers", 1),
    ("panes_are_frozen", 0),
    ("show_zero_values", 1),
    ("automatic_grid_line_colour", 1),
    ("columns_from_right_to_left", 0),
    ("show_outline_symbols", 1),
    ("remove_splits_if_pane_freeze_is_removed", 0),
    ("sheet_selected", 0),
    # "sheet_visible" appears to be merely a clone of "sheet_selected".
    # The real thing is the visibility attribute from the BOUNDSHEET record.
    ("sheet_visible", 0),
    ("show_in_page_break_preview", 0),
    )

def int_floor_div(x, y):
    return divmod(x, y)[0]

class Sheet(BaseObject):
    """Contains the data for one worksheet.

    In the cell access functions, "rowx" is a row index, counting from zero,
    and "colx" is a column index, counting from zero.
    Negative values for row/column indexes and slice positions are supported in
    the expected fashion.

    For information about cell types and cell values, refer to the documentation
    of the Cell class.

    WARNING: You don't call this class yourself. You access Sheet objects via
    the Book object that was returned when you called xlrd.open_workbook("myfile.xls").
    """

    # Name of sheet.
    name = ''

    # Number of rows in sheet. A row index is in range(thesheet.nrows).
    nrows = 0

    # Number of columns in sheet. A column index is in range(thesheet.ncols).
    ncols = 0

    # The map from a column index to a Colinfo object. Often there is an entry
    # in COLINFO records for all column indexes in range(257).
    # Note that xlrd ignores the entry for the non-existent
    # 257th column. On the other hand, there may be no entry for unused columns.
    # - New in version 0.6.1
    colinfo_map = {}

    # The map from a row index to a Rowinfo object. Note that it is possible
    # to have missing entries -- at least one source of XLS files doesn't
    # bother writing ROW records.
    # - New in version 0.6.1
    rowinfo_map = {}

    # List of address ranges of cells containing column labels.
    # These are set up in Excel by Insert > Name > Labels > Columns.
    # - New in version 0.6.0
    # How to deconstruct the list::
    #
    # for crange in thesheet.col_label_ranges:
    #     rlo, rhi, clo, chi = crange
    #     for rx in xrange(rlo, rhi):
    #         for cx in xrange(clo, chi):
    #             print "Column label at (rowx=%d, colx=%d) is %r" \
    #                 (rx, cx, thesheet.cell_value(rx, cx))
    #
    col_label_ranges = []

    # List of address ranges of cells containing row labels.
    # For more details, see <i>col_label_ranges</i> above.
    # - New in version 0.6.0
    row_label_ranges = []

    # List of address ranges of cells which have been merged.
    # These are set up in Excel by Format > Cells > Alignment, then ticking
    # the "Merge cells" box.
    # - New in version 0.6.1. Extracted only if open_workbook(..., formatting_info=True)
    # How to deconstruct the list::
    #
    # for crange in thesheet.merged_cells:
    #     rlo, rhi, clo, chi = crange
    #     for rowx in xrange(rlo, rhi):
    #         for colx in xrange(clo, chi):
    #             # cell (rlo, clo) (the top left one) will carry the data
    #             # and formatting info; the remainder will be recorded as
    #             # blank cells, but a renderer will apply the formatting info
    #             # for the top left cell (e.g. border, pattern) to all cells in
    #             # the range.
    #
    merged_cells = []

    # Default column width from DEFCOLWIDTH record, else None.
    # From the OOo docs:
    # """Column width in characters, using the width of the zero character
    # from default font (first FONT record in the file). Excel adds some
    # extra space to the default width, depending on the default font and
    # default font size. The algorithm how to exactly calculate the resulting
    # column width is not known.
    # Example: The default width of 8 set in this record results in a column
    # width of 8.43 using Arial font with a size of 10 points."""
    # For the default hierarchy, refer to the Colinfo class above.
    # - New in version 0.6.1
    defcolwidth = None

    # Default column width from STANDARDWIDTH record, else None.
    # From the OOo docs:
    # """Default width of the columns in 1/256 of the width of the zero
    # character, using default font (first FONT record in the file)."""
    # For the default hierarchy, refer to the Colinfo class above.
    # - New in version 0.6.1
    standardwidth = None

    # Default value to be used for a row if there is
    # no ROW record for that row.
    # From the <i>optional</i> DEFAULTROWHEIGHT record.
    default_row_height = None

    # Default value to be used for a row if there is
    # no ROW record for that row.
    # From the ´optional´ DEFAULTROWHEIGHT record.
    default_row_height_mismatch = None

    # Default value to be used for a row if there is
    # no ROW record for that row.
    # From the ´optional´ DEFAULTROWHEIGHT record.
    default_row_hidden = None

    # Default value to be used for a row if there is
    # no ROW record for that row.
    # From the <i>optional</i> DEFAULTROWHEIGHT record.
    default_additional_space_above = None

    # Default value to be used for a row if there is
    # no ROW record for that row.
    # From the <i>optional</i> DEFAULTROWHEIGHT record.
    default_additional_space_below = None

    # Visibility of the sheet. 0 = visible, 1 = hidden (can be unhidden
    # by user -- Format/Sheet/Unhide), 2 = "very hidden" (can be unhidden
    # only by VBA macro).
    visibility = 0

    # A 256-element tuple corresponding to the contents of the GCW record for this sheet.
    # If no such record, treat as all bits zero.
    # Applies to BIFF4-7 only. See docs of Colinfo class for discussion.
    gcw = (0, ) * 256

    def __init__(self, book, position, name, number):
        self.book = book
        self.biff_version = book.biff_version
        self._position = position
        self.logfile = book.logfile
        self.pickleable = book.pickleable
        # (to_py3) self.dont_use_array = not(array_array and (CAN_PICKLE_ARRAY or not book.pickleable))
        self.name = name
        self.number = number
        self.verbosity = book.verbosity
        self.formatting_info = book.formatting_info
        self._xf_index_to_xl_type_map = book._xf_index_to_xl_type_map
        self.nrows = 0 # actual, including possibly empty cells
        self.ncols = 0
        self._maxdatarowx = -1 # highest rowx containing a non-empty cell
        self._maxdatacolx = -1 # highest colx containing a non-empty cell
        self._dimnrows = 0 # as per DIMENSIONS record
        self._dimncols = 0
        self._cell_values = []
        self._cell_types = []
        self._cell_xf_indexes = []
        self._need_fix_ragged_rows = 0
        self.defcolwidth = None
        self.standardwidth = None
        self.default_row_height = None
        self.default_row_height_mismatch = 0
        self.default_row_hidden = 0
        self.default_additional_space_above = 0
        self.default_additional_space_below = 0
        self.colinfo_map = {}
        self.rowinfo_map = {}
        self.col_label_ranges = []
        self.row_label_ranges = []
        self.merged_cells = []
        self._xf_index_stats = [0, 0, 0, 0]
        self.visibility = book._sheet_visibility[number] # from BOUNDSHEET record
        for attr, defval in _WINDOW2_options:
            setattr(self, attr, defval)
        self.first_visible_rowx = 0
        self.first_visible_colx = 0
        self.gridline_colour_index = 0x40
        self.gridline_colour_rgb = None # pre-BIFF8
        self.cached_page_break_preview_mag_factor = 0
        self.cached_normal_view_mag_factor = 0
        self._ixfe = None # BIFF2 only
        self._cell_attr_to_xfx = {} # BIFF2.0 only

        #### Don't initialise this here, use class attribute initialisation.
        #### self.gcw = (0, ) * 256 ####

        if self.biff_version >= 80:
            self.utter_max_rows = 65536
        else:
            self.utter_max_rows = 16384
        self.utter_max_cols = 256

    def cell(self, rowx, colx):
        """ Get the XFCell() object in the given row and column. """
        if self.formatting_info:
            xf_index = self.cell_xf_index(rowx, colx)
        else:
            xf_index = None
        ctype = self.cell_type(rowx, colx)
        value = self.cell_value(rowx, colx)
        return Cell(ctype, value, xf_index, self)

    def cell_value(self, rowx, colx):
        """ Value of the cell in the given row and column. """
        return self._cell_values[rowx][colx]

    def cell_type(self, rowx, colx):
        """ Type of the cell in the given row and column.
        Refer to the documentation of the Cell class.
        """
        return self._cell_types[rowx][colx]

    # New in version 0.6.1
    def cell_xf_index(self, rowx, colx):
        """ XF index of the cell in the given row and column.
        This is an index into Book.xf_list.
        """
        self.req_fmt_info()
        xfx = self._cell_xf_indexes[rowx][colx]
        if xfx > -1:
            self._xf_index_stats[0] += 1
            return xfx
        # Check for a row xf_index
        try:
            xfx = self.rowinfo_map[rowx].xf_index
            if xfx > -1:
                self._xf_index_stats[1] += 1
                return xfx
        except KeyError:
            pass
        # Check for a column xf_index
        try:
            xfx = self.colinfo_map[colx].xf_index
            assert xfx > -1
            self._xf_index_stats[2] += 1
            return xfx
        except KeyError:
            # If all else fails, 15 is used as hardwired global default xf_index.
            self._xf_index_stats[3] += 1
            return 15


    def row(self, rowx):
        """ Returns a sequence of the Cell objects in the given row. """
        return [self.cell(rowx, colx) for colx in range(self.ncols)]

    def row_types(self, rowx, start_colx=0, end_colx=None):
        """ Returns a slice of the types of the cells in the given row. """
        if end_colx is None:
            return self._cell_types[rowx][start_colx:]
        return self._cell_types[rowx][start_colx:end_colx]

    def row_values(self, rowx, start_colx=0, end_colx=None):
        """ Returns a slice of the values of the cells in the given row. """
        if end_colx is None:
            return self._cell_values[rowx][start_colx:]
        return self._cell_values[rowx][start_colx:end_colx]

    def row_slice(self, rowx, start_colx=0, end_colx=None):
        """ Returns a slice of the Cell objects in the given row. """
        nc = self.ncols
        if start_colx < 0:
            start_colx += nc
            if start_colx < 0:
                start_colx = 0
        if end_colx is None or end_colx > nc:
            end_colx = nc
        elif end_colx < 0:
            end_colx += nc
        return [self.cell(rowx, colx) for colx in range(start_colx, end_colx)]

    def col_slice(self, colx, start_rowx=0, end_rowx=None):
        """ Returns a slice of the Cell objects in the given column. """
        nr = self.nrows
        if start_rowx < 0:
            start_rowx += nr
            if start_rowx < 0:
                start_rowx = 0
        if end_rowx is None or end_rowx > nr:
            end_rowx = nr
        elif end_rowx < 0:
            end_rowx += nr
        return [self.cell(rowx, colx) for rowx in range(start_rowx, end_rowx)]

    col = col_slice
    """ Returns a sequence of the Cell objects in the given column. """

    def col_values(self, colx, start_rowx=0, end_rowx=None):
        """ Returns a slice of the values of the cells in the given column. """
        nr = self.nrows
        if start_rowx < 0:
            start_rowx += nr
            if start_rowx < 0:
                start_rowx = 0
        if end_rowx is None or end_rowx > nr:
            end_rowx = nr
        elif end_rowx < 0:
            end_rowx += nr
        return [self._cell_values[rowx][colx] for rowx in range(start_rowx, end_rowx)]

    def col_types(self, colx, start_rowx=0, end_rowx=None):
        """ Returns a slice of the types of the cells in the given column. """
        nr = self.nrows
        if start_rowx < 0:
            start_rowx += nr
            if start_rowx < 0:
                start_rowx = 0
        if end_rowx is None or end_rowx > nr:
            end_rowx = nr
        elif end_rowx < 0:
            end_rowx += nr
        return [self._cell_types[rowx][colx] for rowx in range(start_rowx, end_rowx)]

    # Following methods are used in building the worksheet.
    # They are not part of the API.

    def extend_cells(self, nr, nc):
        assert 1 <= nc <= self.utter_max_cols
        assert 1 <= nr <= self.utter_max_rows
        if nr <= self.nrows:
            # New cell is in an existing row, so extend that row (if necessary).
            # Note that nr < self.nrows means that the cell data
            # is not in ascending row order!!
            self._need_fix_ragged_rows = 1
            nrx = nr - 1
            trow = self._cell_types[nrx]
            tlen = len(trow)
            nextra = max(nc, self.ncols) - tlen
            if nextra > 0:
                xce = XL_CELL_EMPTY
                #(to_py3) if self.dont_use_array: ... removed
                trow.extend(array('B', [xce]) * nextra)
                if self.formatting_info:
                    self._cell_xf_indexes[nrx].extend(array('h', [-1]) * nextra)
                self._cell_values[nrx].extend([''] * nextra)
        if nc > self.ncols:
            self.ncols = nc
            self._need_fix_ragged_rows = 1
        if nr > self.nrows:
            scta = self._cell_types.append
            scva = self._cell_values.append
            scxa = self._cell_xf_indexes.append
            fmt_info = self.formatting_info
            xce = XL_CELL_EMPTY
            nc = self.ncols

            #(to_py3) if self.dont_use_array: ... removed
            for _unused in range(self.nrows, nr):
                scta(array('B', [xce]) * nc)
                scva([''] * nc)
                if fmt_info:
                    scxa(array('h', [-1]) * nc)
            self.nrows = nr

    def fix_ragged_rows(self):
        t0 = time.time()
        ncols = self.ncols
        xce = XL_CELL_EMPTY
        s_cell_types = self._cell_types
        s_cell_values = self._cell_values
        s_cell_xf_indexes = self._cell_xf_indexes
        s_fmt_info = self.formatting_info
        totrowlen = 0
        for rowx in range(self.nrows):
            trow = s_cell_types[rowx]
            rlen = len(trow)
            totrowlen += rlen
            nextra = ncols - rlen
            if nextra > 0:
                s_cell_values[rowx][rlen:] = [''] * nextra
                trow.extend(array('B', [xce]) * nextra)
                if s_fmt_info:
                    s_cell_xf_indexes[rowx][rlen:] = array('h', [-1]) * nextra
        self._fix_ragged_rows_time = time.time() - t0

    def tidy_dimensions(self):
        if self.verbosity >= 3:
            fprintf(self.logfile,
                "tidy_dimensions: nrows=%d ncols=%d _need_fix_ragged_rows=%d\n",
                self.nrows, self.ncols, self._need_fix_ragged_rows)
        if self.merged_cells:
            nr = nc = 0
            umaxrows = self.utter_max_rows
            umaxcols = self.utter_max_cols
            for crange in self.merged_cells:
                rlo, rhi, clo, chi = crange
                if not (0 <= rlo < rhi <= umaxrows) \
                or not (0 <= clo < chi <= umaxcols):
                    fprintf(self.logfile,
                        "*** WARNING: sheet #%d (%r), MERGEDCELLS bad range %r\n",
                        self.number, self.name, crange)
                if rhi > nr: nr = rhi
                if chi > nc: nc = chi
            self.extend_cells(nr, nc)
        if self.verbosity >= 1 and \
           (self.nrows != self._dimnrows or self.ncols != self._dimncols):
            fprintf(self.logfile,
                "NOTE *** sheet %d (%r): DIMENSIONS R,C = %d,%d should be %d,%d\n",
                self.number,
                self.name,
                self._dimnrows,
                self._dimncols,
                self.nrows,
                self.ncols,
                )
        if self._need_fix_ragged_rows:
            self.fix_ragged_rows()

    def put_cell(self, rowx, colx, ctype, value, xf_index):
        try:
            self._cell_types[rowx][colx] = ctype
            self._cell_values[rowx][colx] = value
            if self.formatting_info:
                self._cell_xf_indexes[rowx][colx] = xf_index
        except IndexError:
            self.extend_cells(rowx+1, colx+1)
            try:
                self._cell_types[rowx][colx] = ctype
                self._cell_values[rowx][colx] = value
                if self.formatting_info:
                    self._cell_xf_indexes[rowx][colx] = xf_index
            except:
                print("put_cell", rowx, colx, file=self.logfile)
                raise
        except:
            print("put_cell", rowx, colx, file=self.logfile)
            raise

    def put_blank_cell(self, rowx, colx, xf_index):
        # This is used for cells from BLANK and MULBLANK records
        ctype = XL_CELL_BLANK
        value = ''
        try:
            self._cell_types[rowx][colx] = ctype
            self._cell_values[rowx][colx] = value
            self._cell_xf_indexes[rowx][colx] = xf_index
        except IndexError:
            self.extend_cells(rowx+1, colx+1)
            try:
                self._cell_types[rowx][colx] = ctype
                self._cell_values[rowx][colx] = value
                self._cell_xf_indexes[rowx][colx] = xf_index
            except:
                print("put_cell", rowx, colx, file=self.logfile)
                raise
        except:
            print("put_cell", rowx, colx, file=self.logfile)
            raise

    def put_number_cell(self, rowx, colx, value, xf_index):
        # for debugging
        if type(value) == float and isnan(value):
            pass
        ctype = self._xf_index_to_xl_type_map[xf_index]
        try:
            self._cell_types[rowx][colx] = ctype
            self._cell_values[rowx][colx] = value
            if self.formatting_info:
                self._cell_xf_indexes[rowx][colx] = xf_index
        except IndexError:
            self.extend_cells(rowx+1, colx+1)
            try:
                self._cell_types[rowx][colx] = ctype
                self._cell_values[rowx][colx] = value
                if self.formatting_info:
                    self._cell_xf_indexes[rowx][colx] = xf_index
            except:
                print("put_number_cell", rowx, colx, file=self.logfile)
                raise
        except:
            print("put_number_cell", rowx, colx, file=self.logfile)
            raise

    # === Methods after this line neither know nor care about how cells are stored.

    def read(self, bk):
        global rc_stats
        DEBUG = 0
        verbose = DEBUG or self.verbosity >= 2
        verbose_rows = DEBUG or self.verbosity >= 4
        verbose_formulas = 1 and verbose
        oldpos = bk._position
        bk._position = self._position
        XL_SHRFMLA_ETC_ETC = (
            XL_SHRFMLA, XL_ARRAY, XL_TABLEOP, XL_TABLEOP2,
            XL_ARRAY2, XL_TABLEOP_B2,
            )
        self_put_number_cell = self.put_number_cell
        self_put_cell = self.put_cell
        self_put_blank_cell = self.put_blank_cell
        local_unpack = unpack
        bk_get_record_parts = bk.get_record_parts
        bv = self.biff_version
        fmt_info = self.formatting_info
        eof_found = 0
        while 1:
            rc, data_len, data = bk_get_record_parts()
            if rc == XL_NUMBER:
                rowx, colx, xf_index, d = local_unpack('<HHHd', data)
                self_put_number_cell(rowx, colx, d, xf_index)
            elif rc == XL_LABELSST:
                rowx, colx, xf_index, sstindex = local_unpack('<HHHi', data)
                self_put_cell(rowx, colx, XL_CELL_TEXT, bk._sharedstrings[sstindex], xf_index)
            elif rc == XL_LABEL or rc == XL_RSTRING:
                rowx, colx, xf_index = local_unpack('<HHH', data[0:6])
                if bv < BIFF_FIRST_UNICODE:
                    strg = unpack_string(data, 6, bk.encoding or bk.derive_encoding, lenlen=2)
                else:
                    strg = unpack_unicode(data, 6, lenlen=2)
                self_put_cell(rowx, colx, XL_CELL_TEXT, strg, xf_index)
            elif rc == XL_RK:
                rowx, colx, xf_index = local_unpack('<HHH', data[:6])
                d = unpack_RK(data[6:10])
                self_put_number_cell(rowx, colx, d, xf_index)
            elif rc == XL_MULRK:
                mulrk_row, mulrk_first = local_unpack('<HH', data[0:4])
                mulrk_last, = local_unpack('<H', data[-2:])
                pos = 4
                for colx in range(mulrk_first, mulrk_last+1):
                    xf_index, = local_unpack('<H', data[pos:pos+2])
                    d = unpack_RK(data[pos+2:pos+6])
                    pos += 6
                    self_put_number_cell(mulrk_row, colx, d, xf_index)
            elif rc == XL_ROW:
                # Version 0.6.0a3: ROW records are just not worth using (for memory allocation).
                # Version 0.6.1: now used for formatting info.
                if not fmt_info: continue
                rowx, bits1, bits2 = local_unpack('<H4xH4xi', data[0:16])
                if not(0 <= rowx < self.utter_max_rows):
                    print("*** NOTE: ROW record has row index %d; " \
                        "should have 0 <= rowx < %d -- record ignored!" \
                        % (rowx, self.utter_max_rows), file=self.logfile)
                    continue
                r = Rowinfo()
                # Using upkbits() is far too slow on a file
                # with 30 sheets each with 10K rows :-(
                #    upkbits(r, bits1, (
                #        ( 0, 0x7FFF, 'height'),
                #        (15, 0x8000, 'has_default_height'),
                #        ))
                #    upkbits(r, bits2, (
                #        ( 0, 0x00000007, 'outline_level'),
                #        ( 4, 0x00000010, 'outline_group_starts_ends'),
                #        ( 5, 0x00000020, 'hidden'),
                #        ( 6, 0x00000040, 'height_mismatch'),
                #        ( 7, 0x00000080, 'has_default_xf_index'),
                #        (16, 0x0FFF0000, 'xf_index'),
                #        (28, 0x10000000, 'additional_space_above'),
                #        (29, 0x20000000, 'additional_space_below'),
                #        ))
                # So:
                r.height = bits1 & 0x7fff
                r.has_default_height = (bits1 >> 15) & 1
                r.outline_level = bits2 & 7
                r.outline_group_starts_ends = (bits2 >> 4) & 1
                r.hidden = (bits2 >> 5) & 1
                r.height_mismatch = (bits2 >> 6) & 1
                r.has_default_xf_index = (bits2 >> 7) & 1
                r.xf_index = (bits2 >> 16) & 0xfff
                r.additional_space_above = (bits2 >> 28) & 1
                r.additional_space_below = (bits2 >> 29) & 1
                if not r.has_default_xf_index:
                    r.xf_index = -1
                self.rowinfo_map[rowx] = r
                if 0 and r.xf_index > -1:
                    fprintf(self.logfile,
                        "**ROW %d %d %d\n",
                        self.number, rowx, r.xf_index)
                if verbose_rows:
                    print('ROW', rowx, bits1, bits2, file=self.logfile)
                    r.dump(self.logfile,
                        header="--- sh #%d, rowx=%d ---" % (self.number, rowx))
            elif rc in XL_FORMULA_OPCODES: # 06, 0206, 0406
                if bv >= 50:
                    # IMPORTANT result_str is bytes
                    rowx, colx, xf_index, result_str, flags = local_unpack('<HHH8sH', data[0:16])
                    lenlen = 2
                    tkarr_offset = 20
                elif bv >= 30:
                    rowx, colx, xf_index, result_str, flags = local_unpack('<HHH8sH', data[0:16])
                    lenlen = 2
                    tkarr_offset = 16
                else: # BIFF2
                    rowx, colx, cell_attr,  result_str, flags = local_unpack('<HH3s8sB', data[0:16])
                    xf_index =  self.fixed_BIFF2_xfindex(cell_attr, rowx, colx)
                    lenlen = 1
                    tkarr_offset = 16
                if verbose_formulas: # testing formula dumper
                    #### XXXX FIXME
                    fprintf(self.logfile, "FORMULA: rowx=%d colx=%d\n", rowx, colx)
                    fmlalen = local_unpack("<H", data[20:22])[0]
                    decompile_formula(bk, data[22:], fmlalen,
                        reldelta=0, browx=rowx, bcolx=colx, verbose=1)
                if result_str[6:8] == b'\xFF\xFF':
                    if result_str[0]  == 0: #b'\x00':
                        # need to read next record (STRING)
                        gotstring = 0
                        # if flags & 8:
                        if 1: # "flags & 8" applies only to SHRFMLA
                            # actually there's an optional SHRFMLA or ARRAY etc record to skip over
                            rc2, data2_len, data2 = bk.get_record_parts()
                            if rc2 == XL_STRING or rc2 == XL_STRING_B2:
                                gotstring = 1
                            elif rc2 == XL_ARRAY:
                                row1x, rownx, col1x, colnx, array_flags, tokslen = \
                                    local_unpack("<HHBBBxxxxxH", data2[:14])
                                if verbose_formulas:
                                    fprintf(self.logfile, "ARRAY: %d %d %d %d %d\n",
                                        row1x, rownx, col1x, colnx, array_flags)
                                    dump_formula(bk, data2[14:], tokslen, bv, reldelta=0, verbose=1)
                            elif rc2 == XL_SHRFMLA:
                                row1x, rownx, col1x, colnx, nfmlas, tokslen = \
                                    local_unpack("<HHBBxBH", data2[:10])
                                if verbose_formulas:
                                    fprintf(self.logfile, "SHRFMLA (sub): %d %d %d %d %d\n",
                                        row1x, rownx, col1x, colnx, nfmlas)
                                    decompile_formula(bk, data2[10:], tokslen, reldelta=1, verbose=1)
                            elif rc2 not in XL_SHRFMLA_ETC_ETC:
                                raise XLRDError(
                                    "Expected SHRFMLA, ARRAY, TABLEOP* or STRING record; found 0x%04x" % rc2)
                            # if DEBUG: print "gotstring:", gotstring
                        # now for the STRING record
                        if not gotstring:
                            rc2, _unused_len, data2 = bk.get_record_parts()
                            if rc2 not in (XL_STRING, XL_STRING_B2):
                                raise XLRDError("Expected STRING record; found 0x%04x" % rc2)
                        # if DEBUG: print "STRING: data=%r BIFF=%d cp=%d" % (data2, self.biff_version, bk.encoding)
                        if self.biff_version < BIFF_FIRST_UNICODE:
                            strg = unpack_string(data2, 0, bk.encoding or bk.derive_encoding, lenlen=1 + int(bv > 20))
                        else:
                            strg = unpack_unicode(data2, 0, lenlen=2)
                        self.put_cell(rowx, colx, XL_CELL_TEXT, strg, xf_index)
                        # if DEBUG: print "FORMULA strg %r" % strg
                    elif result_str[0] == 1: #b'\x01':
                        # boolean formula result
                        value = result_str[2]
                        self.put_cell(rowx, colx, XL_CELL_BOOLEAN, value, xf_index)
                    elif result_str[0] == 2: #b'\x02':
                        # Error in cell
                        value = result_str[2]
                        self.put_cell(rowx, colx, XL_CELL_ERROR, value, xf_index)
                    elif result_str[0] == 3:#b'\x03':
                        # empty ... i.e. empty (zero-length) string, NOT an empty cell.
                        self.put_cell(rowx, colx, XL_CELL_TEXT, "", xf_index)
                    else:
                        raise XLRDError("unexpected special case (0x%02x) in FORMULA" % result_str[0])
                else:
                    # it is a number
                    d = local_unpack('<d', result_str)[0]
                    self_put_number_cell(rowx, colx, d, xf_index)
            elif rc == XL_BOOLERR:
                rowx, colx, xf_index, value, is_err = local_unpack('<HHHBB', data[:8])
                # Note OOo Calc 2.0 writes 9-byte BOOLERR records.
                # OOo docs say 8. Excel writes 8.
                cellty = (XL_CELL_BOOLEAN, XL_CELL_ERROR)[is_err]
                # if DEBUG: print "XL_BOOLERR", rowx, colx, xf_index, value, is_err
                self.put_cell(rowx, colx, cellty, value, xf_index)
            elif rc == XL_COLINFO:
                if not fmt_info: continue
                c = Colinfo()
                first_colx, last_colx, c.width, c.xf_index, flags \
                    = local_unpack("<HHHHH", data[:10])
                #### Colinfo.width is denominated in 256ths of a character,
                #### *not* in characters.
                if not(0 <= first_colx <= last_colx <= 256):
                    # Note: 256 instead of 255 is a common mistake.
                    # We silently ignore the non-existing 257th column in that case.
                    print("*** NOTE: COLINFO record has first col index %d, last %d; " \
                        "should have 0 <= first <= last <= 255 -- record ignored!" \
                        % (first_colx, last_colx), file=self.logfile)
                    del c
                    continue
                upkbits(c, flags, (
                    ( 0, 0x0001, 'hidden'),
                    ( 1, 0x0002, 'bit1_flag'),
                    # *ALL* colinfos created by Excel in "default" cases are 0x0002!!
                    # Maybe it's "locked" by analogy with XFProtection data.
                    ( 8, 0x0700, 'outline_level'),
                    (12, 0x1000, 'collapsed'),
                    ))
                for colx in range(first_colx, last_colx+1):
                    if colx > 255: break # Excel does 0 to 256 inclusive
                    self.colinfo_map[colx] = c
                    if 0:
                        fprintf(self.logfile,
                            "**COL %d %d %d\n",
                            self.number, colx, c.xf_index)
                if verbose:
                    fprintf(
                        self.logfile,
                        "COLINFO sheet #%d cols %d-%d: wid=%d xf_index=%d flags=0x%04x\n",
                        self.number, first_colx, last_colx, c.width, c.xf_index, flags,
                        )
                    c.dump(self.logfile, header='===')
            elif rc == XL_DEFCOLWIDTH:
                self.defcolwidth, = local_unpack("<H", data[:2])
                if 0: print('DEFCOLWIDTH', self.defcolwidth, file=self.logfile)
            elif rc == XL_STANDARDWIDTH:
                if data_len != 2:
                    print('*** ERROR *** STANDARDWIDTH', data_len, repr(data), file=self.logfile)
                self.standardwidth, = local_unpack("<H", data[:2])
                if 0: print('STANDARDWIDTH', self.standardwidth, file=self.logfile)
            elif rc == XL_GCW:
                if not fmt_info: continue # useless w/o COLINFO
                assert data_len == 34
                assert data[0:2] == "\x20\x00"
                iguff = unpack("<8i", data[2:34])
                gcw = []
                for bits in iguff:
                    for j in range(32):
                        gcw.append(bits & 1)
                        bits >>= 1
                self.gcw = tuple(gcw)
                if 0:
                    showgcw = "".join(["F "[x] for x in gcw]).rstrip().replace(' ', '.')
                    print("GCW:", showgcw)
            elif rc == XL_BLANK:
                if not fmt_info: continue
                rowx, colx, xf_index = local_unpack('<HHH', data[:6])
                if 0: print("BLANK", rowx, colx, xf_index, file=self.logfile)
                self_put_blank_cell(rowx, colx, xf_index)
            elif rc == XL_MULBLANK: # 00BE
                if not fmt_info: continue
                mul_row, mul_first = local_unpack('<HH', data[0:4])
                mul_last, = local_unpack('<H', data[-2:])
                if 0:
                    print("MULBLANK", mul_row, mul_first, mul_last, file=self.logfile)
                pos = 4
                for colx in range(mul_first, mul_last+1):
                    xf_index, = local_unpack('<H', data[pos:pos+2])
                    pos += 2
                    self_put_blank_cell(mul_row, colx, xf_index)
            elif rc == XL_DIMENSION or rc == XL_DIMENSION2:
                # if data_len == 10:
                # Was crashing on BIFF 4.0 file w/o the two trailing unused bytes.
                # Reported by Ralph Heimburger.
                if bv < 80:
                    dim_tuple = local_unpack('<HxxH', data[2:8])
                else:
                    dim_tuple = local_unpack('<ixxH', data[4:12])
                self.nrows, self.ncols = 0, 0
                self._dimnrows, self._dimncols = dim_tuple
                if not self.book._xf_epilogue_done:
                    # Needed for bv <= 40
                    self.book.xf_epilogue()
                if verbose:
                    fprintf(self.logfile,
                        "sheet %d(%r) DIMENSIONS: ncols=%d nrows=%d\n",
                        self.number, self.name, self._dimncols, self._dimnrows
                        )
            elif rc == XL_EOF:
                DEBUG = 0
                if DEBUG: print("SHEET.READ: EOF", file=self.logfile)
                eof_found = 1
                break
            elif rc == XL_OBJ:
                # handle SHEET-level objects; note there's a separate Book.handle_obj
                self.handle_obj(data)
            elif rc == XL_MSO_DRAWING:
                self.handle_msodrawingetc(rc, data_len, data)
            elif rc == XL_TXO:
                self.handle_txo(data)
            elif rc == XL_NOTE:
                self.handle_note(data)
            elif rc == XL_FEAT11:
                self.handle_feat11(data)
            elif rc in bofcodes: ##### EMBEDDED BOF #####
                version, boftype = local_unpack('<HH', data[0:4])
                if boftype != 0x20: # embedded chart
                    print("*** Unexpected embedded BOF (0x%04x) at offset %d: version=0x%04x type=0x%04x" \
                        % (rc, bk._position - data_len - 4, version, boftype), file=self.logfile)
                while 1:
                    code, data_len, data = bk.get_record_parts()
                    if code == XL_EOF:
                        break
                if DEBUG: print("---> found EOF", file=self.logfile)
            elif rc == XL_COUNTRY:
                bk.handle_country(data)
            elif rc == XL_LABELRANGES:
                pos = 0
                pos = unpack_cell_range_address_list_update_pos(
                        self.row_label_ranges, data, pos, bv, addr_size=8,
                        )
                pos = unpack_cell_range_address_list_update_pos(
                        self.col_label_ranges, data, pos, bv, addr_size=8,
                        )
                assert pos == data_len
            elif rc == XL_ARRAY:
                row1x, rownx, col1x, colnx, array_flags, tokslen = \
                    local_unpack("<HHBBBxxxxxH", data[:14])
                if verbose_formulas:
                    print("ARRAY:", row1x, rownx, col1x, colnx, array_flags)
                    dump_formula(bk, data[14:], tokslen, bv, reldelta=0, verbose=1)
            elif rc == XL_SHRFMLA:
                row1x, rownx, col1x, colnx, nfmlas, tokslen = \
                    local_unpack("<HHBBxBH", data[:10])
                if verbose_formulas:
                    print("SHRFMLA (main):", row1x, rownx, col1x, colnx, nfmlas)
                    decompile_formula(bk, data[10:], tokslen, reldelta=0, verbose=1)
            elif rc == XL_CONDFMT:
                if not fmt_info: continue
                assert bv >= 80
                num_CFs, needs_recalc, browx1, browx2, bcolx1, bcolx2 = \
                    unpack("<6H", data[0:12])
                if self.verbosity >= 1:
                    fprintf(self.logfile,
                        "\n*** WARNING: Ignoring CONDFMT (conditional formatting) record\n" \
                        "*** in Sheet %d (%r).\n" \
                        "*** %d CF record(s); needs_recalc_or_redraw = %d\n" \
                        "*** Bounding box is %s\n",
                        self.number, self.name, num_CFs, needs_recalc,
                        rangename2d(browx1, browx2+1, bcolx1, bcolx2+1),
                        )
                olist = [] # updated by the function
                pos = unpack_cell_range_address_list_update_pos(
                    olist, data, 12, bv, addr_size=8)
                # print >> self.logfile, repr(result), len(result)
                if self.verbosity >= 1:
                    fprintf(self.logfile,
                        "*** %d individual range(s):\n" \
                        "*** %s\n",
                        len(olist),
                        ", ".join([rangename2d(*coords) for coords in olist]),
                        )
            elif rc == XL_CF:
                if not fmt_info: continue
                cf_type, cmp_op, sz1, sz2, flags = unpack("<BBHHi", data[0:10])
                font_block = (flags >> 26) & 1
                bord_block = (flags >> 28) & 1
                patt_block = (flags >> 29) & 1
                if self.verbosity >= 1:
                    fprintf(self.logfile,
                        "\n*** WARNING: Ignoring CF (conditional formatting) sub-record.\n" \
                        "*** cf_type=%d, cmp_op=%d, sz1=%d, sz2=%d, flags=0x%08x\n" \
                        "*** optional data blocks: font=%d, border=%d, pattern=%d\n",
                        cf_type, cmp_op, sz1, sz2, flags,
                        font_block, bord_block, patt_block,
                        )
                # hex_char_dump(data, 0, data_len)
                pos = 12
                if font_block:
                    (font_height, font_options, weight, escapement, underline,
                    font_colour_index, two_bits, font_esc, font_underl) = \
                    unpack("<64x i i H H B 3x i 4x i i i 18x", data[pos:pos+118])
                    font_style = (two_bits > 1) & 1
                    posture = (font_options > 1) & 1
                    font_canc = (two_bits > 7) & 1
                    cancellation = (font_options > 7) & 1
                    if self.verbosity >= 1:
                        fprintf(self.logfile,
                            "*** Font info: height=%d, weight=%d, escapement=%d,\n" \
                            "*** underline=%d, colour_index=%d, esc=%d, underl=%d,\n" \
                            "*** style=%d, posture=%d, canc=%d, cancellation=%d\n",
                            font_height, weight, escapement, underline,
                            font_colour_index, font_esc, font_underl,
                            font_style, posture, font_canc, cancellation,
                            )
                    pos += 118
                if bord_block:
                    pos += 8
                if patt_block:
                    pos += 4
                fmla1 = data[pos:pos+sz1]
                pos += sz1
                if verbose and sz1:
                    fprintf(self.logfile,
                        "*** formula 1:\n",
                        )
                    dump_formula(bk, fmla1, sz1, bv, reldelta=0, verbose=1)
                fmla2 = data[pos:pos+sz2]
                pos += sz2
                assert pos == data_len
                if verbose and sz2:
                    fprintf(self.logfile,
                        "*** formula 2:\n",
                        )
                    dump_formula(bk, fmla2, sz2, bv, reldelta=0, verbose=1)
            elif rc == XL_DEFAULTROWHEIGHT:
                if data_len == 4:
                    bits, self.default_row_height = unpack("<HH", data[:4])
                elif data_len == 2:
                    self.default_row_height, = unpack("<H", data)
                    bits = 0
                    fprintf(self.logfile,
                        "*** WARNING: DEFAULTROWHEIGHT record len is 2, " \
                        "should be 4; assuming BIFF2 format\n")
                else:
                    bits = 0
                    fprintf(self.logfile,
                        "*** WARNING: DEFAULTROWHEIGHT record len is %d, " \
                        "should be 4; ignoring this record\n",
                        data_len)
                self.default_row_height_mismatch = bits & 1
                self.default_row_hidden = (bits >> 1) & 1
                self.default_additional_space_above = (bits >> 2) & 1
                self.default_additional_space_below = (bits >> 3) & 1
            elif rc == XL_MERGEDCELLS:
                if not fmt_info: continue
                pos = unpack_cell_range_address_list_update_pos(
                    self.merged_cells, data, 0, bv, addr_size=8)
                if verbose:
                    fprintf(self.logfile,
                        "MERGEDCELLS: %d ranges\n", int_floor_div(pos - 2, 8))
                assert pos == data_len, \
                    "MERGEDCELLS: pos=%d data_len=%d" % (pos, data_len)
            elif rc == XL_WINDOW2:
                if bv >= 80:
                    (options,
                    self.first_visible_rowx, self.first_visible_colx,
                    self.gridline_colour_index,
                    self.cached_page_break_preview_mag_factor,
                    self.cached_normal_view_mag_factor
                    ) = unpack("<HHHHxxHH", data[:14])
                else: # BIFF3-7
                    (options,
                    self.first_visible_rowx, self.first_visible_colx,
                    ) = unpack("<HHH", data[:6])
                    self.gridline_colour_rgb = unpack("<BBB", data[6:9])
                    self.gridline_colour_index = \
                        nearest_colour_index(
                            self.book.colour_map,
                            self.gridline_colour_rgb,
                            debug=0)
                    self.cached_page_break_preview_mag_factor = 0 # default (60%)
                    self.cached_normal_view_mag_factor = 0 # default (100%)
                # options -- Bit, Mask, Contents:
                # 0 0001H 0 = Show formula results 1 = Show formulas
                # 1 0002H 0 = Do not show grid lines 1 = Show grid lines
                # 2 0004H 0 = Do not show sheet headers 1 = Show sheet headers
                # 3 0008H 0 = Panes are not frozen 1 = Panes are frozen (freeze)
                # 4 0010H 0 = Show zero values as empty cells 1 = Show zero values
                # 5 0020H 0 = Manual grid line colour 1 = Automatic grid line colour
                # 6 0040H 0 = Columns from left to right 1 = Columns from right to left
                # 7 0080H 0 = Do not show outline symbols 1 = Show outline symbols
                # 8 0100H 0 = Keep splits if pane freeze is removed 1 = Remove splits if pane freeze is removed
                # 9 0200H 0 = Sheet not selected 1 = Sheet selected (BIFF5-BIFF8)
                # 10 0400H 0 = Sheet not visible 1 = Sheet visible (BIFF5-BIFF8)
                # 11 0800H 0 = Show in normal view 1 = Show in page break preview (BIFF8)
                # The freeze flag specifies, if a following PANE record (6.71) describes unfrozen or frozen panes.
                for attr, _unused_defval in _WINDOW2_options:
                    setattr(self, attr, options & 1)
                    options >>= 1
                # print "WINDOW2: visible=%d selected=%d" \
                #     % (self.sheet_visible, self.sheet_selected)
            #### all of the following are for BIFF <= 4W
            elif bv <= 45:
                if rc == XL_FORMAT or rc == XL_FORMAT2:
                    bk.handle_format(data, rc)
                elif rc == XL_FONT or rc == XL_FONT_B3B4:
                    bk.handle_font(data)
                elif rc == XL_STYLE:
                    if not self.book._xf_epilogue_done:
                        self.book.xf_epilogue()
                    bk.handle_style(data)
                elif rc == XL_PALETTE:
                    bk.handle_palette(data)
                elif rc == XL_BUILTINFMTCOUNT:
                    bk.handle_builtinfmtcount(data)
                elif rc == XL_XF4 or rc == XL_XF3 or rc == XL_XF2: #### N.B. not XL_XF
                    bk.handle_xf(data)
                elif rc == XL_DATEMODE:
                    bk.handle_datemode(data)
                elif rc == XL_CODEPAGE:
                    bk.handle_codepage(data)
                elif rc == XL_FILEPASS:
                    bk.handle_filepass(data)
                elif rc == XL_WRITEACCESS:
                    bk.handle_writeaccess(data)
                elif rc == XL_IXFE:
                    self._ixfe = local_unpack('<H', data)[0]
                elif rc == XL_NUMBER_B2:
                    rowx, colx, cell_attr, d = local_unpack('<HH3sd', data)
                    self_put_number_cell(rowx, colx, d, self.fixed_BIFF2_xfindex(cell_attr, rowx, colx))
                elif rc == XL_INTEGER:
                    rowx, colx, cell_attr, d = local_unpack('<HH3sH', data)
                    self_put_number_cell(rowx, colx, float(d), self.fixed_BIFF2_xfindex(cell_attr, rowx, colx))
                elif rc == XL_LABEL_B2:
                    rowx, colx, cell_attr = local_unpack('<HH3s', data[0:7])
                    strg = unpack_string(data, 7, bk.encoding or bk.derive_encoding(), lenlen=1)
                    self_put_cell(rowx, colx, XL_CELL_TEXT, strg, self.fixed_BIFF2_xfindex(cell_attr, rowx, colx))
                elif rc == XL_BOOLERR_B2:
                    rowx, colx, cell_attr, value, is_err = local_unpack('<HH3sBB', data)
                    cellty = (XL_CELL_BOOLEAN, XL_CELL_ERROR)[is_err]
                    # if DEBUG: print "XL_BOOLERR_B2", rowx, colx, cell_attr, value, is_err
                    self.put_cell(rowx, colx, cellty, value, self.fixed_BIFF2_xfindex(cell_attr, rowx, colx))
                elif rc == XL_BLANK_B2:
                    if not fmt_info: continue
                    rowx, colx, cell_attr = local_unpack('<HH3s', data[:7])
                    self_put_blank_cell(rowx, colx, self.fixed_BIFF2_xfindex(cell_attr, rowx, colx))
                elif rc == XL_EFONT:
                    bk.handle_efont(data)
                elif rc == XL_ROW_B2:
                    if not fmt_info: continue
                    rowx, bits1, has_defaults = local_unpack('<H4xH2xB', data[0:11])
                    if not(0 <= rowx < self.utter_max_rows):
                        print("*** NOTE: ROW_B2 record has row index %d; " \
                            "should have 0 <= rowx < %d -- record ignored!" \
                            % (rowx, self.utter_max_rows), file=self.logfile)
                        continue
                    r = Rowinfo()
                    r.height = bits1 & 0x7fff
                    r.has_default_height = (bits1 >> 15) & 1
                    r.outline_level = 0
                    r.outline_group_starts_ends = 0
                    r.hidden = 0
                    r.height_mismatch = 0
                    r.has_default_xf_index = has_defaults & 1
                    r.additional_space_above = 0
                    r.additional_space_below = 0
                    if not r.has_default_xf_index:
                        r.xf_index = -1
                    elif data_len == 18:
                        # Seems the XF index in the cell_attr is dodgy
                        xfx = local_unpack('<H', data[16:18])[0]
                        r.xf_index = self.fixed_BIFF2_xfindex(cell_attr=None, rowx=rowx, colx=-1, true_xfx=xfx)
                    else:
                        cell_attr = data[13:16]
                        r.xf_index = self.fixed_BIFF2_xfindex(cell_attr, rowx, colx=-1)
                    self.rowinfo_map[rowx] = r
                    if 0 and r.xf_index > -1:
                        fprintf(self.logfile,
                            "**ROW %d %d %d\n",
                            self.number, rowx, r.xf_index)
                    if verbose_rows:
                        print('ROW_B2', rowx, bits1, has_defaults, file=self.logfile)
                        r.dump(self.logfile,
                            header="--- sh #%d, rowx=%d ---" % (self.number, rowx))
                elif rc == XL_COLWIDTH: # BIFF2 only
                    if not fmt_info: continue
                    first_colx, last_colx, width\
                        = local_unpack("<BBH", data[:4])
                    if not(first_colx <= last_colx):
                        print("*** NOTE: COLWIDTH record has first col index %d, last %d; " \
                            "should have first <= last -- record ignored!" \
                            % (first_colx, last_colx), file=self.logfile)
                        continue
                    for colx in range(first_colx, last_colx+1):
                        if colx in self.colinfo_map:
                            c = self.colinfo_map[colx]
                        else:
                            c = Colinfo()
                            self.colinfo_map[colx] = c
                        c.width = width
                    if verbose:
                        fprintf(
                            self.logfile,
                            "COLWIDTH sheet #%d cols %d-%d: wid=%d\n",
                            self.number, first_colx, last_colx, width
                            )
                elif rc == XL_COLUMNDEFAULT: # BIFF2 only
                    if not fmt_info: continue
                    first_colx, last_colx = local_unpack("<HH", data[:4])
                    #### Warning OOo docs wrong; first_colx <= colx < last_colx
                    if verbose:
                        fprintf(
                            self.logfile,
                            "COLUMNDEFAULT sheet #%d cols in range(%d, %d)\n",
                            self.number, first_colx, last_colx
                            )
                    if not(0 <= first_colx < last_colx <= 256):
                        print("*** NOTE: COLUMNDEFAULT record has first col index %d, last %d; " \
                            "should have 0 <= first < last <= 256" \
                            % (first_colx, last_colx), file=self.logfile)
                        last_colx = min(last_colx, 256)
                    for colx in range(first_colx, last_colx):
                        offset = 4 + 3 * (colx - first_colx)
                        cell_attr = data[offset:offset+3]
                        xf_index = self.fixed_BIFF2_xfindex(cell_attr, rowx=-1, colx=colx)
                        if colx in self.colinfo_map:
                            c = self.colinfo_map[colx]
                        else:
                            c = Colinfo()
                            self.colinfo_map[colx] = c
                        c.xf_index = xf_index
        if not eof_found:
            raise XLRDError("Sheet %d (%r) missing EOF record" \
                % (self.number, self.name))
        self.tidy_dimensions()
        bk._position = oldpos
        return 1

    def fixed_BIFF2_xfindex(self, cell_attr, rowx, colx, true_xfx=None):
        DEBUG = 0
        verbose = DEBUG or self.verbosity >= 2
        if self.biff_version == 21:
            if self._xf_index_to_xl_type_map:
                if true_xfx is not None:
                    xfx = true_xfx
                else:
                    xfx = cell_attr[0] & 0x3F
                if xfx == 0x3F:
                    if self._ixfe is None:
                        raise XLRDError("BIFF2 cell record has XF index 63 but no preceding IXFE record.")
                    xfx = self._ixfe
                    # OOo docs are capable of interpretation that each
                    # cell record is preceded immediately by its own IXFE record.
                    # Empirical evidence is that (sensibly) an IXFE record applies to all
                    # following cell records until another IXFE comes along.
                return xfx
            # Have either Excel 2.0, or broken 2.1 w/o XF records -- same effect.
            self.biff_version = self.book.biff_version = 20
        #### check that XF slot in cell_attr is zero
        xfx_slot = cell_attr[0] & 0x3F
        assert xfx_slot == 0
        xfx = self._cell_attr_to_xfx.get(cell_attr)
        if xfx is not None:
            return xfx
        if verbose:
            fprintf(self.logfile, "New cell_attr %r at (%r, %r)\n", cell_attr, rowx, colx)
        book = self.book
        xf = self.fake_XF_from_BIFF20_cell_attr(cell_attr)
        xfx = len(book.xf_list)
        xf.xf_index = xfx
        book.xf_list.append(xf)
        if verbose:
            xf.dump(self.logfile, header="=== Faked XF %d ===" % xfx, footer="======")
        if xf.format_key not in book.format_map:
            msg = "ERROR *** XF[%d] unknown format key (%d, 0x%04x)\n"
            fprintf(self.logfile, msg,
                    xf.xf_index, xf.format_key, xf.format_key)
            fmt = Format(xf.format_key, FUN, "General")
            book.format_map[xf.format_key] = fmt
            while len(book.format_list) <= xf.format_key:
                book.format_list.append(fmt)
        cellty_from_fmtty = {
            FNU: XL_CELL_NUMBER,
            FUN: XL_CELL_NUMBER,
            FGE: XL_CELL_NUMBER,
            FDT: XL_CELL_DATE,
            FTX: XL_CELL_NUMBER, # Yes, a number can be formatted as text.
            }
        fmt = book.format_map[xf.format_key]
        cellty = cellty_from_fmtty[fmt.type]
        self._xf_index_to_xl_type_map[xf.xf_index] = cellty
        self._cell_attr_to_xfx[cell_attr] = xfx
        return xfx

    def fake_XF_from_BIFF20_cell_attr(self, cell_attr):
        from .formatting import XF, XFAlignment, XFBorder, XFBackground, XFProtection
        xf = XF()
        xf.alignment = XFAlignment()
        xf.alignment.indent_level = 0
        xf.alignment.shrink_to_fit = 0
        xf.alignment.text_direction = 0
        xf.border = XFBorder()
        xf.border.diag_up = 0
        xf.border.diag_down = 0
        xf.border.diag_colour_index = 0
        xf.border.diag_line_style = 0 # no line
        xf.background = XFBackground()
        xf.protection = XFProtection()
        (prot_bits, font_and_format, halign_etc) = unpack('<BBB', cell_attr)
        xf.format_key = font_and_format & 0x3F
        xf.font_index = (font_and_format & 0xC0) >> 6
        upkbits(xf.protection, prot_bits, (
            (6, 0x40, 'cell_locked'),
            (7, 0x80, 'formula_hidden'),
            ))
        xf.alignment.hor_align = halign_etc & 0x07
        for mask, side in ((0x08, 'left'), (0x10, 'right'), (0x20, 'top'), (0x40, 'bottom')):
            if halign_etc & mask:
                colour_index, line_style = 8, 1 # black, thin
            else:
                colour_index, line_style = 0, 0 # none, none
            setattr(xf.border, side + '_colour_index', colour_index)
            setattr(xf.border, side + '_line_style', line_style)
        bg = xf.background
        if halign_etc & 0x80:
            bg.fill_pattern = 17
        else:
            bg.fill_pattern = 0
        bg.background_colour_index = 9 # white
        bg.pattern_colour_index = 8 # black
        xf.parent_style_index = 0 # ???????????
        xf.alignment.vert_align = 2 # bottom
        xf.alignment.rotation = 0
        for attr_stem in ("format", "font", "alignment", "border", \
                          "background", "protection"):
            attr = "_%s_flag" % attr_stem
            setattr(xf, attr, 1)
        return xf

    def req_fmt_info(self):
        if not self.formatting_info:
            raise XLRDError("Feature requires open_workbook(..., formatting_info=True)")

    # Determine column display width.
    # - New in version 0.6.1
    #
    # @param colx Index of the queried column, range 0 to 255.
    # Note that it is possible to find out the width that will be used to display
    # columns with no cell information e.g. column IV (colx=255).
    # @return The column width that will be used for displaying
    # the given column by Excel, in units of 1/256th of the width of a
    # standard character (the digit zero in the first font).

    def computed_column_width(self, colx):
        self.req_fmt_info()
        if self.biff_version >= 80:
            colinfo = self.colinfo_map.get(colx, None)
            if colinfo is not None:
                return colinfo.width
            if self.standardwidth is not None:
                return self.standardwidth
        elif self.biff_version >= 40:
            if self.gcw[colx]:
                if self.standardwidth is not None:
                    return self.standardwidth
            else:
                colinfo = self.colinfo_map.get(colx, None)
                if colinfo is not None:
                    return colinfo.width
        elif self.biff_version == 30:
            colinfo = self.colinfo_map.get(colx, None)
            if colinfo is not None:
                return colinfo.width
        # All roads lead to Rome and the DEFCOLWIDTH ...
        if self.defcolwidth is not None:
            return self.defcolwidth * 256
        return 8 * 256 # 8 is what Excel puts in a DEFCOLWIDTH record

    def handle_msodrawingetc(self, recid, data_len, data):
        if not OBJ_MSO_DEBUG:
            return
        DEBUG = 1
        if self.biff_version < 80:
            return
        o = MSODrawing()
        pos = 0
        while pos < data_len:
            tmp, fbt, cb = unpack('<HHI', data[pos:pos+8])
            ver = tmp & 0xF
            inst = (tmp >> 4) & 0xFFF
            if ver == 0xF:
                ndb = 0 # container
            else:
                ndb = cb
            if DEBUG:
                hex_char_dump(data, pos, ndb + 8, base=0, fout=self.logfile)
                fprintf(self.logfile,
                    "fbt:0x%04X  inst:%d  ver:0x%X  cb:%d (0x%04X)\n",
                    fbt, inst, ver, cb, cb)
            if fbt == 0xF010: # Client Anchor
                assert ndb == 18
                (o.anchor_unk,
                o.anchor_colx_lo, o.anchor_rowx_lo,
                o.anchor_colx_hi, o.anchor_rowx_hi) = unpack('<Hiiii', data[pos+8:pos+8+ndb])
            elif fbt == 0xF011: # Client Data
                # must be followed by an OBJ record
                assert cb == 0
                assert pos + 8 == data_len
            else:
                pass
            pos += ndb + 8
        else:
            # didn't break out of while loop
            assert pos == data_len
        if DEBUG:
            o.dump(self.logfile, header="=== MSODrawing ===", footer= " ")


    def handle_obj(self, data):
        if not OBJ_MSO_DEBUG:
            return
        DEBUG = 1
        if self.biff_version < 80:
            return
        o = MSObj()
        data_len = len(data)
        pos = 0
        if DEBUG:
            fprintf(self.logfile, "... OBJ record ...\n")
        while pos < data_len:
            ft, cb = unpack('<HH', data[pos:pos+4])
            if DEBUG:
                hex_char_dump(data, pos, cb, base=0, fout=self.logfile)
            if ft == 0x15: # ftCmo ... s/b first
                assert pos == 0
                o.type, o.id, option_flags = unpack('<HHH', data[pos+4:pos+10])
                upkbits(o, option_flags, (
                    ( 0, 0x0001, 'locked'),
                    ( 4, 0x0010, 'printable'),
                    ( 8, 0x0100, 'autofilter'), # not documented in Excel 97 dev kit
                    ( 9, 0x0200, 'scrollbar_flag'), # not documented in Excel 97 dev kit
                    (13, 0x2000, 'autofill'),
                    (14, 0x4000, 'autoline'),
                    ))
            elif ft == 0x00:
                assert cb == 0
                assert pos + 4 == data_len
            elif ft == 0x0C: # Scrollbar
                values = unpack('<5H', data[pos+8:pos+18])
                for value, tag in zip(values, ('value', 'min', 'max', 'inc', 'page')):
                    setattr(o, 'scrollbar_' + tag, value)
            elif ft == 0x0D: # "Notes structure" [used for cell comments]
                pass ############## not documented in Excel 97 dev kit
            elif ft == 0x13: # list box data
                if o.autofilter: # non standard exit. NOT documented
                    break
            else:
                pass
            pos += cb + 4
        else:
            # didn't break out of while loop
            assert pos == data_len
        if DEBUG:
            o.dump(self.logfile, header="=== MSOBj ===", footer= " ")

    def handle_note(self, data):
        if not OBJ_MSO_DEBUG:
            return
        DEBUG = 1
        if self.biff_version < 80:
            return
        if DEBUG:
            fprintf(self.logfile, '... NOTE record ...\n')
            hex_char_dump(data, 0, len(data), base=0, fout=self.logfile)
        o = MSNote()
        data_len = len(data)
        o.rowx, o.colx, option_flags, o.object_id = unpack('<4H', data[:8])
        o.show = (option_flags >> 1) & 1
        # Docs say NULL [sic] bytes padding between string count and string data
        # to ensure that string is word-aligned. Appears to be nonsense.
        # There also seems to be a random(?) byte after the string (not counted in the
        # string length.
        o.original_author, endpos = unpack_unicode_update_pos(data, 8, lenlen=2)
        assert endpos == data_len - 1
        o.last_byte = data[-1]
        if DEBUG:
            o.dump(self.logfile, header="=== MSNote ===", footer= " ")

    def handle_txo(self, data):
        if not OBJ_MSO_DEBUG:
            return
        DEBUG = 1
        if self.biff_version < 80:
            return
        o = MSTxo()
        data_len = len(data)
        option_flags, o.rot, cchText, cbRuns = unpack('<HH6xHH4x', data)
        upkbits(o, option_flags, (
            (3, 0x000E, 'horz_align'),
            (6, 0x0070, 'vert_align'),
            (9, 0x0200, 'lock_text'),
            ))
        rc2, data2_len, data2 = self.book.get_record_parts()
        assert rc2 == XL_CONTINUE
        o.text, endpos = unpack_unicode_update_pos(data2, 0, known_len=cchText)
        assert endpos == data2_len
        rc3, data3_len, data3 = self.book.get_record_parts()
        assert rc3 == XL_CONTINUE
        # ignore the formatting runs for the moment
        if DEBUG:
            o.dump(self.logfile, header="=== MSTxo ===", footer= " ")

    def handle_feat11(self, data):
        if not OBJ_MSO_DEBUG:
            return
        # rt: Record type; this matches the BIFF rt in the first two bytes of the record; =0872h
        # grbitFrt: FRT cell reference flag (see table below for details)
        # Ref0: Range reference to a worksheet cell region if grbitFrt=1 (bitFrtRef). Otherwise blank.
        # isf: Shared feature type index =5 for Table
        # fHdr: =0 since this is for feat not feat header
        # reserved0: Reserved for future use =0 for Table
        # cref: Count of ref ranges this feature is on
        # cbFeatData: Count of byte for the current feature data.
        # reserved1: =0 currently not used
        # Ref1: Repeat of Ref0. UNDOCUMENTED
        rt, grbitFrt, Ref0, isf, fHdr, reserved0, cref, cbFeatData, reserved1, Ref1 = unpack('<HH8sHBiHiH8s', data[0:35])
        assert reserved0 == 0
        assert reserved1 == 0
        assert isf == 5
        assert rt == 0x872
        assert fHdr == 0
        assert Ref1 == Ref0
        print("FEAT11: grbitFrt=%d  Ref0=%r cref=%d cbFeatData=%d" % (grbitFrt, Ref0, cref, cbFeatData))
        # lt: Table data source type:
        #   =0 for Excel Worksheet Table =1 for read-write SharePoint linked List
        #   =2 for XML mapper Table =3 for Query Table
        # idList: The ID of the Table (unique per worksheet)
        # crwHeader: How many header/title rows the Table has at the top
        # crwTotals: How many total rows the Table has at the bottom
        # idFieldNext: Next id to try when assigning a unique id to a new field
        # cbFSData: The size of the Fixed Data portion of the Table data structure.
        # rupBuild: the rupBuild that generated the record
        # unusedShort: UNUSED short that can be used later. The value is reserved during round-tripping.
        # listFlags: Collection of bit flags: (see listFlags' bit setting table below for detail.)
        # lPosStmCache: Table data stream position of cached data
        # cbStmCache: Count of bytes of cached data
        # cchStmCache: Count of characters of uncompressed cached data in the stream
        # lem: Table edit mode (see List (Table) Editing Mode (lem) setting table below for details.)
        # rgbHashParam: Hash value for SharePoint Table
        # cchName: Count of characters in the Table name string rgbName
        (lt, idList, crwHeader, crwTotals, idFieldNext, cbFSData,
        rupBuild, unusedShort, listFlags, lPosStmCache, cbStmCache,
        cchStmCache, lem, rgbHashParam, cchName) = unpack('<iiiiiiHHiiiii16sH', data[35:35+66])
        print("lt=%d  idList=%d crwHeader=%d  crwTotals=%d  idFieldNext=%d cbFSData=%d\n"\
            "rupBuild=%d  unusedShort=%d listFlags=%04X  lPosStmCache=%d  cbStmCache=%d\n"\
            "cchStmCache=%d  lem=%d  rgbHashParam=%r  cchName=%d" % (
            lt, idList, crwHeader, crwTotals, idFieldNext, cbFSData,
            rupBuild, unusedShort,listFlags, lPosStmCache, cbStmCache,
            cchStmCache, lem, rgbHashParam, cchName))

class MSODrawing(BaseObject):
    pass

class MSObj(BaseObject):
    pass

class MSTxo(BaseObject):
    pass

class MSNote(BaseObject):
    pass

# === helpers ===

def unpack_RK(rk_str):
    #(to_py3): flags = ord(rk_str[0])
    flags = rk_str[0]
    if flags & 2:
        # There's a SIGNED 30-bit integer in there!
        i,  = unpack('<i', rk_str)
        i >>= 2 # div by 4 to drop the 2 flag bits
        if flags & 1:
            return i / 100.0
        return float(i)
    else:
        # It's the most significant 30 bits of an IEEE 754 64-bit FP number
        # (to_py3): replaced b'\0\0\0\0' + chr(flags & 252) + rk_str[1:4]
        _bytes = array('B', b'\0\0\0\0')
        _bytes.append(flags & 252)
        _bytes.extend(rk_str[1:4])
        d, = unpack('<d', _bytes)
        if flags & 1:
            d = d / 100.
        return d

##### =============== Cell ======================================== #####

cellty_from_fmtty = {
    FNU: XL_CELL_NUMBER,
    FUN: XL_CELL_NUMBER,
    FGE: XL_CELL_NUMBER,
    FDT: XL_CELL_DATE,
    FTX: XL_CELL_NUMBER, # Yes, a number can be formatted as text.
    }

ctype_text = {
    XL_CELL_EMPTY: 'empty',
    XL_CELL_TEXT: 'text',
    XL_CELL_NUMBER: 'number',
    XL_CELL_DATE: 'xldate',
    XL_CELL_BOOLEAN: 'bool',
    XL_CELL_ERROR: 'error',
    XL_CELL_BLANK: 'blank',
    }

# Contains the data for one cell -> see XFCell() class in the xfcell module.
class Cell(XFCell):
    def __repr__(self):
        if not self.has_xf:
            return "%s:%r" % (ctype_text[self.ctype], self.value)
        else:
            return "%s:%r (XF:%r)" % (ctype_text[self.ctype], self.value, self.xf_index)

# There is one and only one instance of an empty cell -- it's a singleton. This is it.
# You may use a test like "acell is empty_cell".
empty_cell = Cell(XL_CELL_EMPTY, '')

##### =============== Colinfo and Rowinfo ============================== #####


# Width and default formatting information that applies to one or
# more columns in a sheet. Derived from COLINFO records.
#
#
# Here is the default hierarchy for width, according to the OOo docs:
#
# In BIFF3, if a COLINFO record is missing for a column,
# the width specified in the record DEFCOLWIDTH is used instead.
#
# In BIFF4-BIFF7, the width set in this [COLINFO] record is only used,
# if the corresponding bit for this column is cleared in the GCW
# record, otherwise the column width set in the DEFCOLWIDTH record
# is used (the STANDARDWIDTH record is always ignored in this case [see footnote!]).
#
# In BIFF8, if a COLINFO record is missing for a column,
# the width specified in the record STANDARDWIDTH is used.
# If this [STANDARDWIDTH] record is also missing,
# the column width of the record DEFCOLWIDTH is used instead.
#
# Footnote:  The docs on the GCW record say this:
#
# If a bit is set, the corresponding column uses the width set in the STANDARDWIDTH
# record. If a bit is cleared, the corresponding column uses the width set in the
# COLINFO record for this column.
#
# If a bit is set, and the worksheet does not contain the STANDARDWIDTH record, or if
# the bit is cleared, and the worksheet does not contain the COLINFO record, the DEFCOLWIDTH
# record of the worksheet will be used instead.
#
# At the moment (2007-01-17) xlrd is going with the GCW version of the story.
# Reference to the source may be useful: see the computed_column_width(colx) method
# of the Sheet class.
# - New in version 0.6.1

class Colinfo(BaseObject):
    # Width of the column in 1/256 of the width of the zero character,
    # using default font (first FONT record in the file).
    width = 0
    # XF index to be used for formatting empty cells.
    xf_index = -1
    # 1 = column is hidden
    hidden = 0
    # Value of a 1-bit flag whose purpose is unknown
    # but is often seen set to 1
    bit1_flag = 0
    # Outline level of the column, in range(7).
    # (0 = no outline)
    outline_level = 0
    # 1 = column is collapsed
    collapsed = 0

# Height and default formatting information that applies to a row in a sheet.
# Derived from ROW records.
# - New in version 0.6.1

class Rowinfo(BaseObject):
    ##
    # Height of the row, in twips. One twip == 1/20 of a point
    height = 0
    ##
    # 0 = Row has custom height; 1 = Row has default height
    has_default_height = 0
    ##
    # Outline level of the row
    outline_level = 0
    ##
    # 1 = Outline group starts or ends here (depending on where the
    # outline buttons are located, see WSBOOL record [TODO ??]),
    # <i>and</i> is collapsed
    outline_group_starts_ends = 0
    ##
    # 1 = Row is hidden (manually, or by a filter or outline group)
    hidden = 0
    ##
    # 1 = Row height and default font height do not match
    height_mismatch = 0
    ##
    # 1 = the xf_index attribute is usable; 0 = ignore it
    has_default_xf_index = 0
    ##
    # Index to default XF record for empty cells in this row.
    # Don't use this if has_default_xf_index == 0.
    xf_index = -9999
    ##
    # This flag is set, if the upper border of at least one cell in this row
    # or if the lower border of at least one cell in the row above is
    # formatted with a thick line style. Thin and medium line styles are not
    # taken into account.
    additional_space_above = 0
    ##
    # This flag is set, if the lower border of at least one cell in this row
    # or if the upper border of at least one cell in the row below is
    # formatted with a medium or thick line style. Thin line styles are not
    # taken into account.
    additional_space_below = 0
