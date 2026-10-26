`timescale 1ns/1ps

module tb_or_gate;
    reg a, b;
    wire y;
    integer i, errors;
    reg expected;

    or_gate dut (
        .a(a),
        .b(b),
        .y(y)
    );

    initial begin
        $dumpfile("or_gate.vcd");
        $dumpvars(0, tb_or_gate);
        errors = 0;
        for (i = 0; i < 4; i = i + 1) begin
            a = (i >> 1) & 1;
            b = i & 1;
            expected = a | b;
            #10;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL a=%b b=%b y=%b expected=%b", a, b, y, expected);
            end
        end
        $display("or_gate: %0d errors", errors);
        $finish;
    end
endmodule
