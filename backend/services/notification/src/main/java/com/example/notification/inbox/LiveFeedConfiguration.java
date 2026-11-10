package com.example.notification.inbox;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration(proxyBeanMethods = false)
class LiveFeedConfiguration {

    @Bean
    RedisMessageListenerContainer liveFeedListener(RedisConnectionFactory connections, LiveFeed feed) {
        var container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connections);
        container.addMessageListener(feed, new PatternTopic(Inbox.CHANNEL_PREFIX + "*"));
        return container;
    }
}
