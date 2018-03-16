library(ggplot2)
library(scales)


data = read.csv('datapoints.csv', header = TRUE, sep=",")
data$date = as.POSIXct(data$date, format="%Y-%m-%dT%H:%M:%S")
data$timestamp = as.numeric(data$date)
data$secondofday = data$timestamp %% (3600*24)
data$hourofday = data$secondofday/3600
head(data)


data$memfactor = factor(data$memory)


cbPalette <- c("#999999", "#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7")

# Helper function to get rid of negative histogram values in log y scale
# https://stackoverflow.com/questions/41849951/using-ggplot-geo-geom-histogram-with-y-log-scale-with-zero-bins

mylog10_trans <- function (base = 10) 
{
  trans <- function(x) log(x + 1, base)
  inv <- function(x) base^x
  trans_new(paste0("log-", format(base)), trans, inv, log_breaks(base = base), 
            domain = c(1e-100, Inf))
}

##########################################################
# Google
##########################################################

data_google = data[data$provider=='google',]
entries_google = nrow(data_google)

google_table = table(subset(data,provider=="google")$memory)
google_table = google_table[names(google_table)!=1536]

google_entries = data.frame(
  label = paste("entries = ", as.vector(google_table)),
  memfactor=factor(c("128","256","512","1024","2048")))


ggplot(data_google) + 
	geom_histogram(aes(x=internalTime,fill=memfactor,col=memfactor), binwidth=1, alpha = 0.3, position = "identity") +
	scale_fill_discrete(name="RAM in MB", breaks=c("128","256","512","1024","2048")) + 
	guides(color=FALSE) +
 	xlab("Time in seconds") + labs(title = "Google Cloud Functions") +
 	xlim(0, 60) + 
  # scale_y_log10(limits=c(1, 100000)) +
  scale_y_continuous(trans = "mylog10", breaks=c(10-1, 100-1, 1000-1, 10000-1)) +
  facet_grid(memfactor ~ .)  +
  geom_text(data=google_entries, aes(x = Inf, 
                                     y = Inf, 
                                     hjust = 1.1,
                                     vjust = 1.5, 
                                     label=label), 
            inherit.aes=TRUE, parse=FALSE, size=3)


ggsave("hist-google-all-log.pdf", width = 16, height = 10, units = "cm")


ggplot(data_google) + 
	geom_histogram(aes(x=internalTime,fill=memfactor,col=memfactor), binwidth=0.5, alpha = 0.3, position = "identity") +
	scale_fill_discrete(name="RAM in MB", breaks=c("128","256","512","1024","2048")) + 
	guides(color=FALSE) +
 	xlab("Time in seconds") + labs(title = "Google Cloud Functions") +
 	xlim(0, 60)  +
  annotate("text", x = Inf, y = Inf, hjust = 1.1, vjust = 1.5, label=paste("entries = ",entries_google))
  #geom_text(x = Inf, y = Inf, hjust = 1.1, vjust = 1.5, label=paste("entries = ",entries_google),
  #          inherit.aes=FALSE, parse=FALSE, size=3)
    #  + 
    # facet_grid(memfactor ~ .) 

ggsave("hist-google-all.pdf", width = 18, height = 6, units = "cm")


##########################################################
# AWS
##########################################################


data_aws = data[data$provider=='aws',]
entries_aws = nrow(data_aws)

ggplot(data_aws) + 
	geom_histogram(aes(x=internalTime,fill=memfactor,col=memfactor), binwidth=0.5, alpha = 0.3, position = "identity") +
	scale_fill_discrete(name="RAM in MB", breaks=c("128","256","512","1024","1536")) + 
	guides(color=FALSE) +
 	xlab("Time in seconds") + labs(title = "AWS Lambda") +
#    scale_y_continuous(trans = "mylog10", breaks=c(10-1, 100-1, 1000-1, 10000-1)) +
 	xlim(0, 60) +
  annotate("text", x = Inf, y = Inf, hjust = 1.1, vjust = 1.5, label=paste("entries = ",entries_aws))


ggsave("hist-aws-all.pdf", width = 18, height = 6, units = "cm")



##########################################################
# IBM
##########################################################

data_bluemix = data[data$provider=='bluemix',]
entries_bluemix = nrow(data_bluemix)

ggplot(data_bluemix) + 
	geom_histogram(aes(x=internalTime,fill=memfactor,col=memfactor), binwidth=0.5, alpha = 0.3, position = "identity") +
 	scale_fill_discrete(name="RAM in MB", breaks=c("128","256","512","1024","1536")) + 
 	guides(color=FALSE) +
  xlab("Time in seconds") + labs(title = "IBM Cloud Functions") +
  xlim(0, 60) +
  annotate("text", x = Inf, y = Inf, hjust = 1.1, vjust = 1.5, label=paste("entries = ",entries_bluemix))


 ggsave("hist-bluemix-all.pdf", width = 18, height = 6, units = "cm")


##########################################################
# Azure
##########################################################

data_azure = data[data$provider=='azure',]
entries_azure = nrow(data_azure)
 

ggplot(data_azure) + 
	geom_histogram(aes(x=internalTime,color = "Dyn.", fill="Dyn."), binwidth=0.5, alpha = 0.3, position = "identity") +
#	geom_histogram(aes(Dynamic, color = "Dyn.", fill="Dyn."), binwidth=0.5, alpha = 0.3, position = "identity") +
	scale_fill_discrete(name="RAM in MB", breaks=c("Dyn.")) + 
	guides(color=FALSE) +
 	xlab("Time in seconds") + labs(title = "Azure Functions") +
 	xlim(0, 60) +
  annotate("text", x = Inf, y = Inf, hjust = 1.1, vjust = 1.5, label=paste("entries = ",entries_azure))


ggsave("hist-azure-all.pdf", width = 18, height = 6, units = "cm")



##########################################################
# Some summary statistics
##########################################################

avg_results = aggregate( internalTime ~ memory:provider, data=data, FUN=mean)
avg_results$sd = aggregate(internalTime ~ memory:provider, data=data, FUN=sd)$internalTime
avg_results

aggregate( internalTime ~ provider, data=data, FUN=mean)


# Assuming that time < 10 s is 
percent_faster = nrow(data_google[data_google$memory<2000 & data_google$internalTime<10,])/nrow(data_google[data_google$memory<2000,])
print("Percent of google calls when the function runs faster than expected")
print(percent_faster*100)
# 4.315594