`timescale 1ns/1ps

module tb_mux_2to1;
    reg  s, i0, i1;
    wire y;
    reg  expected;
    integer i, errors;

    mux_2to1 dut (
        .s(s),
        .i0(i0),
        .i1(i1),
        .y(y)
    );

    initial begin
        $dumpfile("mux_2to1.vcd");
        $dumpvars(0, tb_mux_2to1);
        errors = 0;
        for (i = 0; i < 8; i = i + 1) begin
            {s, i0, i1} = i[2:0];
            #10;
            expected = s ? i1 : i0;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL s=%b i0=%b i1=%b y=%b expected=%b", s, i0, i1, y, expected);
            end
        end
        $display("mux_2to1: %0d errors", errors);
        $finish;
    end
endmodule