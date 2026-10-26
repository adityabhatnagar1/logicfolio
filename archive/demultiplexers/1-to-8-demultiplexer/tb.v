`timescale 1ns/1ps

module tb_demux_1to8;
    reg  [2:0] s;
    reg  d;
    wire [7:0] y;
    reg  [7:0] expected;
    integer i, errors;

    demux_1to8 dut (
        .i(d),
        .s(s),
        .y(y)
    );

    initial begin
        $dumpfile("demux_1to8.vcd");
        $dumpvars(0, tb_demux_1to8);
        errors = 0;
        for (i = 0; i < 16; i = i + 1) begin
            {s, d} = i[3:0];
            #10;
            expected = d ? (8'b00000001 << s) : 8'b00000000;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL s=%b i=%b y=%b expected=%b", s, d, y, expected);
            end
        end
        $display("demux_1to8: %0d errors", errors);
        $finish;
    end
endmodule
