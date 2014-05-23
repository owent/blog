Linux 下 GCC 的 动态栈实现
============
<!--[TOC]-->

```cpp
enum __splitstack_context_offsets
{
  MORESTACK_SEGMENTS = 0,
  CURRENT_SEGMENT = 1,
  CURRENT_STACK = 2,
  STACK_GUARD = 3,
  INITIAL_SP = 4,
  INITIAL_SP_LEN = 5,
  BLOCK_SIGNALS = 6, // spec if don't block signals

  NUMBER_OFFSETS = 10
};

struct stack_segment
{
  /* The previous stack segment--when a function running on this stack
     segment returns, it will run on the previous one.  */
     struct stack_segment *prev;

  /* The next stack segment, if it has been allocated--when a function
     is running on this stack segment, the next one is not being
     used.  */
  struct stack_segment *next;

  /* The total size of this stack segment.  */
     size_t size;

  /* The stack address when this stack was created.  This is used when
     popping the stack.  */
  void *old_stack;

  /* A list of memory blocks allocated by dynamic stack
     allocation.  */
  struct dynamic_allocation_blocks *dynamic_allocation;

  /* A list of dynamic memory blocks no longer needed.  */
     struct dynamic_allocation_blocks *free_dynamic_allocation;
  /* An extra pointer in case we need some more information some
     day.  */
  void *extra;

};
```

__splitstack_block_signals_context(*context, *new, *old); // update new signal **val** context to context(context[BLOCK_SIGNALS] = !new)
__splitstack_block_signals(*new, *old); // @see upper, __morestack_initial_sp.dont_block_signals = !new


func __splitstack_makecontext (stack size, *context, *real_usable_stack_size);
> 1. memset context
> 2. allocate segment
>   - round to pagesize
>   - call mmap (to space)
>   - check env SPLIT_STACK_GUARD and determine wether to mprotect the end stack(at head of space if STACK_GROWS_DOWNWARD or tail)
>   - init stack_segment at begin of memory
> 3. context[MORESTACK_SEGMENTS] = context[CURRENT_SEGMENT] = $?
>   * [STACK_GROWS_DOWNWARD]  ### <- ### :  |mprotect section|stack segment head|free memory|
>   * [!STACK_GROWS_DOWNWARD] ### -> ### :                   |stack segment head|free memory|mprotect section|
> 4. initial_sp = address of available stack memory                             |<-       ->|         
>   * begin of start or end of buffer [start, end)                              ^           ^ 
> 5. context[STACK_GUARD] = 初始化栈信息

func __splitstack_setcontext (*context)
> 1. __morestack_segments = context[MORESTACK_SEGMENTS]
> 2. __morestack_current_segment = context[CURRENT_SEGMENT]
> 3. __morestack_set_guard (context[STACK_GUARD])
> 4. __morestack_initial_sp.sp = context[INITIAL_SP]
> 5. __morestack_initial_sp.len = context[INITIAL_SP_LEN]
> 6. __morestack_initial_sp.dont_block_signals = context[BLOCK_SIGNALS]

func __splitstack_getcontext (*context)
> 1. memset context to 0
> 2. __splitstack_setcontext 的反操作



__generic_morestack
__morestack_allocate_stack_space
__splitstack_find



<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="知识共享许可协议" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" /></a>
