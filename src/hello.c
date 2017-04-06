#include<stdio.h>
#include<stdint.h>
#include<stdlib.h>

void Initialize(const uint32_t  seed);
uint32_t ExtractU32();

int main(int argc, char** argv)
{
    printf("Hello World");
    Initialize(0xdeadbeef);

    size_t num = 65 * 1024 * 256;

    uint32_t * randoms = malloc(sizeof(uint32_t) * num);

    for(uint32_t k = 0; k < 10; ++k) {
      for(uint32_t i = 0; i < num; ++i) {
        randoms[i] = ExtractU32();
      }
    }

    for(uint32_t i = 0; i < 10; ++i) {
      printf("%d\n", randoms[i]);
    }

		return 0;
}
