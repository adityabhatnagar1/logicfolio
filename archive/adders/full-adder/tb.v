`timescale 1ns/1ps

module tb_full_adder;
    reg  a, b, cin;
    wire sum, cout;
    integer i, errors;

    full_adder dut (.a(a), .b(b), .cin(cin), .sum(sum), .cout(cout));

    initial begin
        $dumpfile("full_adder.vcd");
        $dumpvars(0, tb_full_adder);
        errors = 0;
        for (i = 0; i < 8; i = i + 1) begin
            {a, b, cin} = i[2:0];
            #10;
            if ({cout, sum} !== a + b + cin) begin
                errors = errors + 1;
                $display("FAIL a=%b b=%b cin=%b -> cout=%b sum=%b", a, b, cin, cout, sum);
            end
        end
        $display("full_adder: %0d errors", errors);
        $finish;
    end
endmodule
