`timescale 1ns/1ps

module tb_comparator_nbit;
    parameter N = 4;

    reg  [N-1:0] a, b;
    wire gt, eq, lt;
    reg  [2:0] expected;
    integer i, j, errors;

    comparator_nbit #(.N(N)) dut (
        .a(a),
        .b(b),
        .gt(gt),
        .eq(eq),
        .lt(lt)
    );

    initial begin
        $dumpfile("comparator_nbit.vcd");
        $dumpvars(0, tb_comparator_nbit);
        errors = 0;
        for (i = 0; i < (1 << N); i = i + 1) begin
            for (j = 0; j < (1 << N); j = j + 1) begin
                a = i;
                b = j;
                #1;
                if (i > j)       expected = 3'b100;
                else if (i == j) expected = 3'b010;
                else             expected = 3'b001;
                if ({gt, eq, lt} !== expected) begin
                    errors = errors + 1;
                    $display("FAIL a=%0d b=%0d got gt/eq/lt=%b expected=%b", a, b, {gt, eq, lt}, expected);
                end
            end
        end
        $display("comparator_nbit: %0d errors", errors);
        $finish;
    end
endmodule