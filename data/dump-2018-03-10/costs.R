
library("ggplot2")
library("scales")
require("ggrepel")

prices =  read.table("data_means.csv", header = TRUE)
prices$name = paste(prices$provider, prices$memory)
prices$cost = prices$internalTime * prices$price * 10
prices

ggplot(data=prices, aes(fill=factor(memory), y=cost, x=provider, alpha = 0.3, color=factor(memory))) + 
    geom_bar(stat="identity",position=position_dodge()) +
    scale_fill_discrete(name="RAM in MB") +
    guides(color=FALSE,alpha=FALSE) +
    ylab("Cost in dollars per task") 
    
ggsave("costs.pdf", width = 16, height = 8, units = "cm")

ggplot(data=prices, aes(fill=factor(memory), y=price, x=provider, alpha = 0.3, color=factor(memory))) + 
    geom_bar(stat="identity",position=position_dodge()) +
    scale_fill_discrete(name="RAM in MB") +
    scale_y_continuous(labels = comma) +
    guides(color=FALSE,alpha=FALSE) +
    ylab("Cost in dollars per 100 ms") 
    
ggsave("prices.pdf", width = 16, height = 8, units = "cm")

ggplot(data=prices, aes(fill=factor(provider), y=cost, x = internalTime)) +
  geom_point(color = "black") +
  theme_classic(base_size = 10) + 
  geom_label_repel(aes(label = prices$memory,
                    fill = factor(prices$provider)), color = 'black',segment.color = 'grey50',
                    size = 3.5) +
  scale_fill_discrete(name="Provider and RAM") +
  ylab("Cost in dollars per task") +
  xlab("Execution time in seconds")  +
  theme_classic(base_size = 12, legend.position = "bottom") 


ggsave("price-perf.pdf", width = 16, height = 12, units = "cm")

