`timescale 1ns/1ps

module tb_mux_16to1;
    reg  [3:0]  s;
    reg  [15:0] d;
    wire y;
    reg  expected;
    integer i, k, errors;

    mux_16to1 dut (
        .s(s),
        .i(d),
        .y(y)
    );

    initial begin
        $dumpfile("mux_16to1.vcd");
        $dumpvars(0, tb_mux_16to1);
        errors = 0;
        for (i = 0; i < 16; i = i + 1) begin
            s = i;
            for (k = 0; k < 16; k = k + 1) begin
                d = 16'b1 << k;
                #1;
                expected = d[s];
                if (y !== expected) begin
                    errors = errors + 1;
                    $display("FAIL s=%b d=%b y=%b expected=%b", s, d, y, expected);
                end
                d = ~(16'b1 << k);
                #1;
                expected = d[s];
                if (y !== expected) begin
                    errors = errors + 1;
                    $display("FAIL s=%b d=%b y=%b expected=%b", s, d, y, expected);
                end
            end
        end
        $display("mux_16to1: %0d errors", errors);
        $finish;
    end
endmodule