`timescale 1ns/1ps

module tb_half_adder;
    reg  a, b;
    wire sum, carry;
    integer i, errors;

    half_adder dut (.a(a), .b(b), .sum(sum), .carry(carry));

    initial begin
        $dumpfile("half_adder.vcd");
        $dumpvars(0, tb_half_adder);
        errors = 0;
        for (i = 0; i < 4; i = i + 1) begin
            {a, b} = i[1:0];
            #10;
            if ({carry, sum} !== a + b) begin
                errors = errors + 1;
                $display("FAIL a=%b b=%b -> carry=%b sum=%b", a, b, carry, sum);
            end
        end
        $display("half_adder: %0d errors", errors);
        $finish;
    end
endmodule
