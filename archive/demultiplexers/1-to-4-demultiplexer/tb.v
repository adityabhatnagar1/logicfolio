`timescale 1ns/1ps

module tb_demux_1to4;
    reg  [1:0] s;
    reg  d;
    wire [3:0] y;
    reg  [3:0] expected;
    integer i, errors;

    demux_1to4 dut (
        .i(d),
        .s(s),
        .y(y)
    );

    initial begin
        $dumpfile("demux_1to4.vcd");
        $dumpvars(0, tb_demux_1to4);
        errors = 0;
        for (i = 0; i < 8; i = i + 1) begin
            {s, d} = i[2:0];
            #10;
            expected = d ? (4'b0001 << s) : 4'b0000;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL s=%b i=%b y=%b expected=%b", s, d, y, expected);
            end
        end
        $display("demux_1to4: %0d errors", errors);
        $finish;
    end
endmodule
