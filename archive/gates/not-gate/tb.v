`timescale 1ns/1ps

module tb_not_gate;
    reg a;
    wire y;
    integer i, errors;
    reg expected;

    not_gate dut (
        .a(a),
        .y(y)
    );

    initial begin
        $dumpfile("not_gate.vcd");
        $dumpvars(0, tb_not_gate);
        errors = 0;
        for (i = 0; i < 2; i = i + 1) begin
            a = i & 1;
            expected = ~a;
            #10;
            if (y !== expected) begin
                errors = errors + 1;
                $display("FAIL a=%b y=%b expected=%b", a, y, expected);
            end
        end
        $display("not_gate: %0d errors", errors);
        $finish;
    end
endmodule
