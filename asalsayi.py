import math


def asalmi(n):
    if n<2:
        return False
    if n==2:
        return True
    
    if n %2 == 0:
        return False
    
    for i in range(3,int(math.sqrt(n))+1,2):
        if n%i==0:
            return False
    return True

while True:

    sayi=int(input("Bir sayı giriniz!"))
    if asalmi(sayi):

        print("asal")

    else:
        print("asal değil")
               