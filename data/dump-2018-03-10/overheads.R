library(ggplot2)

data = read.csv('datapoints.csv', header = TRUE, sep=",")
data$date = as.POSIXct(data$Time, format="%Y-%m-%dT%H:%M:%S")
data$timestamp = as.numeric(data$date)
data$secondofday = data$timestamp %% (3600*24)
data$hourofday = data$secondofday/3600
data$overhead = data$externalTime - data$internalTime
head(data)

levels(data$provider)[levels(data$provider)=="aws"] <- "AWS"
levels(data$provider)[levels(data$provider)=="bluemix"] <- "IBM"
levels(data$provider)[levels(data$provider)=="google"] <- "Google"
levels(data$provider)[levels(data$provider)=="azure"] <- "Azure"

table = table(data$provider)
table = table[names(table)!=""]
                      
entries = data.frame(
  label = paste("entries = ", as.vector(table)),
  provider=c("AWS","Azure","IBM","Google"))


ggplot(data=subset(data,provider != '')) + 
	geom_histogram(aes(overhead, fill=provider, col=provider), binwidth=0.05, alpha = 0.3, position = "identity") +
	scale_fill_discrete(name="RAM", breaks=c("128","256","512","1024","2048")) + 
	guides(color=FALSE) +
  coord_cartesian(xlim=c(0,1.5)) +
 	xlab("Time in seconds")  +
  #labs(title = "AWS") + 
  #theme(plot.title = element_text(hjust = 0.5)) +
  facet_grid(provider ~ ., scale="free_y")+
  geom_text(data=entries, aes(x = Inf, 
                                      y = Inf, 
                                      hjust = 1.1,
                                      vjust = 1.5, 
                                      label=label), 
            inherit.aes=TRUE, parse=FALSE, size=3)


ggsave("hist-overhead.pdf", width = 16, height = 10, units = "cm")



# ggplot(data=subset(data,provider=="google")) + 
#   geom_histogram(aes(overhead, fill=provider, col=provider), binwidth=0.05, alpha = 0.3, position = "identity") +
#   scale_fill_discrete(name="RAM", breaks=c("128","256","512","1024","2048")) + 
#   guides(color=FALSE) +
#   coord_cartesian(xlim=c(0,1.5)) + 
#   xlab("Time in seconds") + labs(title = "Google")+ theme(plot.title = element_text(hjust = 0.5))
# 
# ggsave("hist-google-overhead.pdf", width = 10, height = 10, units = "cm")
# 
# ggplot(data=subset(data,provider=="bluemix")) + 
#   geom_histogram(aes(overhead, fill=provider, col=provider), binwidth=0.05, alpha = 0.3, position = "identity") +
#   scale_fill_discrete(name="RAM", breaks=c("128","256","512","1024","2048")) + 
#   guides(color=FALSE) +
#   coord_cartesian(xlim=c(0,1.5)) + 
#   xlab("Time in seconds") + labs(title = "IBM")+ theme(plot.title = element_text(hjust = 0.5))
# 
# ggsave("hist-bluemix-overhead.pdf", width = 10, height = 10, units = "cm")
# 
# ggplot(data=subset(data,provider=="azure")) + 
#   geom_histogram(aes(overhead, fill=provider, col=provider), binwidth=0.05, alpha = 0.3, position = "identity") +
#   scale_fill_discrete(name="RAM", breaks=c("128","256","512","1024","2048")) + 
#   guides(color=FALSE) +
#   coord_cartesian(xlim=c(0,1.5)) + 
#   xlab("Time in seconds") + labs(title = "Azure")+ theme(plot.title = element_text(hjust = 0.5))
# 
# ggsave("hist-azure-overhead.pdf", width = 10, height = 10, units = "cm")

