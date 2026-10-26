`timescale 1ns/1ps

module tb_comparator_1bit;
    reg  a, b;
    wire gt, eq, lt;
    reg  [2:0] expected;
    integer i, errors;

    comparator_1bit dut (
        .a(a),
        .b(b),
        .gt(gt),
        .eq(eq),
        .lt(lt)
    );

    initial begin
        $dumpfile("comparator_1bit.vcd");
        $dumpvars(0, tb_comparator_1bit);
        errors = 0;
        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            if (a > b)       expected = 3'b100;
            else if (a == b) expected = 3'b010;
            else             expected = 3'b001;
            if ({gt, eq, lt} !== expected) begin
                errors = errors + 1;
                $display("FAIL a=%b b=%b got gt/eq/lt=%b expected=%b", a, b, {gt, eq, lt}, expected);
            end
        end
        $display("comparator_1bit: %0d errors", errors);
        $finish;
    end
endmodule