library(ggplot2)

data = read.csv('datapoints.csv', header = TRUE, sep=",")
head(data)
data$date = as.POSIXct(data$time, format="%Y-%m-%dT%H:%M:%S")
data$timestamp = as.numeric(data$date)
data$secondofday = data$timestamp %% (3600*24)
data$hourofday = data$secondofday/3600

# remove 128 as incomplete
data = data[data$memory %in% c(256, 512, 1024, 1536, 2048), ]

data$memory = factor(data$memory)
head(data)



# Compute number of entries
aws_table = table(subset(data,provider=="aws")$memory)
aws_table = aws_table[names(aws_table)!=2048]
google_table = table(subset(data,provider=="google")$memory)
google_table = google_table[names(google_table)!=1536]

aws_entries = data.frame(
          label = paste("entries = ", as.vector(aws_table)),
          memory=c("256","512","1024","1536"))

google_entries = data.frame(
  label = paste("entries = ", as.vector(google_table)),
  memory=c("256","512","1024","2048"))


ggplot(data=subset(data,provider=="aws")) + 
	geom_histogram(aes(download, fill=memory, col=memory), binwidth=0.25, alpha = 0.3, position = "identity") +
  coord_cartesian(xlim=c(0,8)) + 
  guides(color=FALSE, fill=FALSE) +
 	xlab("Time in seconds") + 
  labs(title="AWS Lambda") +
  facet_grid(memory ~ ., scale="free_y") +
  geom_text(data=aws_entries, aes(x = Inf, 
                              y = Inf, 
                              hjust = 1.1,
                              vjust = 1.5, 
                              label=label), 
            inherit.aes=TRUE, parse=FALSE, size=3)

  

ggsave("hist-aws-transfer.pdf", width = 10, height = 8, units = "cm")


ggplot(data=subset(data,provider=="google")) + 
  geom_histogram(aes(download, fill=memory, col=memory), binwidth=0.5, alpha = 0.3, position = "identity") +
  scale_fill_discrete(name="RAM", breaks=c("256","512","1024","2048")) + 
  guides(color=FALSE, fill=FALSE) +
  coord_cartesian(xlim=c(0,40)) + 
  xlab("Time in seconds") + 
  labs(title="Google Cloud Functions") +
  facet_grid(memory ~ ., scale="free_y") +
  geom_text(data=google_entries, aes(x = Inf, 
                                  y = Inf, 
                                  hjust = 1.1,
                                  vjust = 1.5, 
                                  label=label), 
            inherit.aes=TRUE, parse=FALSE, size=3)

ggsave("hist-google-transfer.pdf", width = 10, height = 8, units = "cm")

ggplot(data=subset(data,provider=="aws")) + 
  geom_histogram(aes(upload, fill=memory, col=memory), binwidth=0.25, alpha = 0.3, position = "identity") +
  scale_fill_discrete(name="RAM", breaks=c("256","512","1024","2048")) + 
  guides(color=FALSE, fill=FALSE) +
  coord_cartesian(xlim=c(0,8)) + 
  xlab("Time in seconds") + 
  labs(title="AWS Lambda") +
  facet_grid(memory ~ ., scale="free_y") +
  geom_text(data=aws_entries, aes(x = Inf, 
                                  y = Inf, 
                                  hjust = 1.1,
                                  vjust = 1.5, 
                                  label=label), 
            inherit.aes=TRUE, parse=FALSE, size=3)


ggsave("hist-aws-transfer-upload.pdf", width = 10, height = 8, units = "cm")


ggplot(data=subset(data,provider=="google")) + 
  geom_histogram(aes(upload, fill=memory, col=memory), binwidth=0.5, alpha = 0.3, position = "identity") +
  scale_fill_discrete(name="RAM", breaks=c("256","512","1024","2048")) + 
  guides(color=FALSE, fill=FALSE) +
  coord_cartesian(xlim=c(0,40)) + 
  xlab("Time in seconds") + 
  labs(title="Google Cloud Functions") +
  facet_grid(memory ~ ., scale="free_y") +
  geom_text(data=google_entries, aes(x = Inf, 
                                     y = Inf, 
                                     hjust = 1.1,
                                     vjust = 1.5, 
                                     label=label), 
            inherit.aes=TRUE, parse=FALSE, size=3)

ggsave("hist-google-transfer-upload.pdf", width = 10, height = 8, units = "cm")

