`timescale 1ns/1ps

module tb_ripple_carry_adder;
    reg  [3:0] a, b;
    reg        cin;
    wire [3:0] sum;
    wire       cout;
    reg  [4:0] expected;
    integer i, errors;

    ripple_carry_adder #(.N(4)) dut (.a(a), .b(b), .cin(cin), .sum(sum), .cout(cout));

    initial begin
        $dumpfile("ripple_carry_adder.vcd");
        $dumpvars(0, tb_ripple_carry_adder);
        errors = 0;
        for (i = 0; i < 512; i = i + 1) begin
            {cin, a, b} = i[8:0];
            #1;
            expected = a + b + cin;
            if ({cout, sum} !== expected) begin
                errors = errors + 1;
                $display("FAIL a=%0d b=%0d cin=%b -> %0d", a, b, cin, {cout, sum});
            end
        end
        $display("ripple_carry_adder: %0d errors", errors);
        $finish;
    end
endmodule
