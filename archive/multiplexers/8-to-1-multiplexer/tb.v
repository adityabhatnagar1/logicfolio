`timescale 1ns/1ps

module tb_mux_8to1;
    reg  [2:0] s;
    reg  [7:0] d;
    wire y;
    reg  expected;
    integer i, errors;

    mux_8to1 dut (
        .s(s),
        .i(d),
        .y(y)
    );

    initial begin
        $dumpfile("mux_8to1.vcd");
        $dumpvars(0, tb_mux_8to1);
        errors = 0;
        for (i = 0; i < 2048; i = i + 1) begin
            {s, d} = i[10:0];
            #1;
            expected = d[s];
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL s=%b d=%b y=%b expected=%b", s, d, y, expected);
            end
        end
        $display("mux_8to1: %0d errors", errors);
        $finish;
    end
endmodule