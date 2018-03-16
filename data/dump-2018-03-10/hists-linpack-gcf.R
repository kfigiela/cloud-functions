library(ggplot2)

data = read.table('gcflinpack_all.csv', header = TRUE)

google_table = table(data$memory)
google_table = google_table[names(google_table)!=1536]

google_entries = data.frame(
  label = paste("entries = ", as.vector(google_table)),
  memory=c("128","256","512","1024","2048"))

ggplot(data) + 
	geom_point(aes(x=memory, y=task), shape=19, alpha=0.1) +
 	xlab("Memory in MB") + ylab("GFlops") + labs(title = "Linpack on Google Cloud Functions") + ylim (0,36)

ggsave("linpack-gcf-memory-points.png", width = 10, height = 10, units = "cm")
ggsave("linpack-gcf-memory-points.pdf", width = 10, height = 10, units = "cm")

ggplot(data) + 
	geom_point(aes(x=size, y=task), shape=19, alpha=0.1) +
 	xlab("Size") + ylab("GFlops") + labs(title = "Linpack on Google Cloud Functions")

ggsave("linpack-gcf-size-points.png", width = 10, height = 10, units = "cm")
ggsave("linpack-gcf-size-points.pdf", width = 10, height = 10, units = "cm")

data$memory = factor(data$memory)
data$size = factor(data$size)
head(data)

ggplot(data) + 
	geom_density(aes(x=task,fill=memory,col=memory), binwidth=0.2, alpha = 0.2, position = "identity") +
 	xlab("GFlops") + labs(title = "GCF Linpack")

ggsave("linpack-gcf-dens.png", width = 16, height = 10, units = "cm")


ggplot(data) + 
	geom_histogram(aes(x=task), binwidth=0.2, position = "identity", colour="black", fill="white") +
 	facet_grid(size ~ .) +
 	xlab("GFlops") + labs(title = "Linpack on Google Cloud Functions") +
  geom_text(data=google_entries, aes(x = Inf, 
                                     y = Inf, 
                                     hjust = 1.1,
                                     vjust = 1.5, 
                                     label=label), 
            inherit.aes=TRUE, parse=FALSE, size=3)

ggsave("linpack-gcf-size-hist.png", width = 10, height = 20, units = "cm")


ggplot(data) + 
	geom_histogram(aes(x=task), binwidth=0.5, position = "identity", colour="black", fill="white") +
 	facet_grid(memory ~ .) +
 	xlab("GFlops") + labs(title = "Linpack on Google Cloud Functions") +
  geom_text(data=google_entries, aes(x = Inf, 
                                     y = Inf, 
                                     hjust = 1.1,
                                     vjust = 1.5, 
                                     label=label), 
            inherit.aes=TRUE, parse=FALSE, size=3)

ggsave("linpack-gcf-memory-hist.png", width = 10, height = 12, units = "cm")
ggsave("linpack-gcf-memory-hist.pdf", width = 10, height = 12, units = "cm")


ggplot(data) + 
	geom_violin(aes(x=memory, y=task)) +  coord_flip() +
 	xlab("Memory in MB") + ylab("GFlops") + labs(title = "Linpack on Google Cloud Functions")

ggsave("linpack-gcf-memory-violin.png", width = 10, height = 10, units = "cm")




# data = read.table('awslinpack_all.csv', header = TRUE)

# ggplot(data) + 
# 	geom_point(aes(x=memory, y=task), shape=19, alpha=0.1) +
#  	xlab("Memory in MB") + ylab("GFlops") + labs(title = "AWS Linpack")

# ggsave("linpack-aws-memory-points.png", width = 10, height = 10, units = "cm")
# ggsave("linpack-aws-memory-points.pdf", width = 10, height = 10, units = "cm")

# ggplot(data) + 
# 	geom_point(aes(x=size, y=task), shape=19, alpha=0.1) +
#  	xlab("Size") + ylab("GFlops") + labs(title = "AWS Linpack")

# ggsave("linpack-aws-size-points.png", width = 10, height = 10, units = "cm")
# ggsave("linpack-aws-size-points.pdf", width = 10, height = 10, units = "cm")

# data$memory = factor(data$memory)
# data$size = factor(data$size)
# head(data)

# ggplot(data) + 
# 	geom_density(aes(x=task,fill=memory,col=memory), binwidth=0.2, alpha = 0.2, position = "identity") +
#  	xlab("GFlops") + labs(title = "AWS Linpack")

# ggsave("linpack-aws-dens.png", width = 16, height = 10, units = "cm")


# ggplot(data) + 
# 	geom_histogram(aes(x=task), binwidth=0.2, position = "identity", colour="black", fill="white") +
#  	facet_grid(size ~ .) +
#  	xlab("GFlops") + labs(title = "AWS Linpack")

# ggsave("linpack-aws-size-hist.png", width = 10, height = 20, units = "cm")


# data = data[data$memory %in% c(128, 256, 512, 1024, 1536), ]
# ggplot(data) + 
# 	geom_histogram(aes(x=task), binwidth=1, position = "identity", colour="black", fill="white") +
#  	facet_grid(memory ~ .) +
#  	xlab("GFlops") + labs(title = "AWS Linpack")

# ggsave("linpack-aws-memory-hist.png", width = 10, height = 12, units = "cm")
# ggsave("linpack-aws-memory-hist.pdf", width = 10, height = 12, units = "cm")

