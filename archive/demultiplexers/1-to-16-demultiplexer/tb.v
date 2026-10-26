`timescale 1ns/1ps

module tb_demux_1to16;
    reg  [3:0]  s;
    reg  d;
    wire [15:0] y;
    reg  [15:0] expected;
    integer i, errors;

    demux_1to16 dut (
        .i(d),
        .s(s),
        .y(y)
    );

    initial begin
        $dumpfile("demux_1to16.vcd");
        $dumpvars(0, tb_demux_1to16);
        errors = 0;
        for (i = 0; i < 32; i = i + 1) begin
            {s, d} = i[4:0];
            #10;
            expected = d ? (16'b1 << s) : 16'b0;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL s=%b i=%b y=%b expected=%b", s, d, y, expected);
            end
        end
        $display("demux_1to16: %0d errors", errors);
        $finish;
    end
endmodule
