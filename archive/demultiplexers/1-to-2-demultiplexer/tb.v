`timescale 1ns/1ps

module tb_demux_1to2;
    reg  s, d;
    wire y0, y1;
    reg  [1:0] expected;
    integer i, errors;

    demux_1to2 dut (
        .s(s),
        .i(d),
        .y0(y0),
        .y1(y1)
    );

    initial begin
        $dumpfile("demux_1to2.vcd");
        $dumpvars(0, tb_demux_1to2);
        errors = 0;
        for (i = 0; i < 4; i = i + 1) begin
            {s, d} = i[1:0];
            #10;
            expected = d ? (2'b01 << s) : 2'b00;
            if ({y1, y0} !== expected) begin
                errors = errors + 1;
                $display("FAIL s=%b i=%b y1y0=%b expected=%b", s, d, {y1, y0}, expected);
            end
        end
        $display("demux_1to2: %0d errors", errors);
        $finish;
    end
endmodule
